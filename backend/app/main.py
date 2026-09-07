from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from enum import Enum
from uuid import UUID, uuid4
import hashlib, hmac, os

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "sqlite:///./pivomechanik.db"
    allowed_origins: str = "http://localhost"
    telegram_webhook_secret: str = "dev-secret"
settings = Settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
class Base(DeclarativeBase): pass
class ClientStatus(str, Enum): PENDING="PENDING"; ACTIVE="ACTIVE"; BLOCKED="BLOCKED"
class OrderStatus(str, Enum): NEW="NEW"; CONFIRMED="CONFIRMED"; PROCESSING="PROCESSING"; READY="READY"; SHIPPED="SHIPPED"; COMPLETED="COMPLETED"; CANCELLED="CANCELLED"
class Category(Base):
    __tablename__="categories"; id: Mapped[UUID]=mapped_column(primary_key=True,default=uuid4); slug: Mapped[str]=mapped_column(String(80),unique=True); name: Mapped[str]=mapped_column(String(100))
class Product(Base):
    __tablename__="products"; id: Mapped[UUID]=mapped_column(primary_key=True,default=uuid4); slug: Mapped[str]=mapped_column(String(100),unique=True); name: Mapped[str]=mapped_column(String(140)); style: Mapped[str]=mapped_column(String(100)); description: Mapped[str]=mapped_column(Text); abv: Mapped[float]=mapped_column(Float); ibu: Mapped[int]=mapped_column(Integer); price: Mapped[float]=mapped_column(Float); wholesale_price: Mapped[float]=mapped_column(Float); stock_quantity: Mapped[int]=mapped_column(Integer,default=0); image_url: Mapped[str]=mapped_column(String(500),default=""); category_id: Mapped[UUID|None]=mapped_column(ForeignKey("categories.id"),nullable=True)
class WholesaleApplication(Base):
    __tablename__="wholesale_applications"; id: Mapped[UUID]=mapped_column(primary_key=True,default=uuid4); company: Mapped[str]=mapped_column(String(180)); contact_name: Mapped[str]=mapped_column(String(180)); phone: Mapped[str]=mapped_column(String(50)); telegram: Mapped[str|None]=mapped_column(String(100),nullable=True); email: Mapped[str]=mapped_column(String(250)); city: Mapped[str]=mapped_column(String(120)); business_type: Mapped[str]=mapped_column(String(100)); outlets: Mapped[int]=mapped_column(Integer,default=1); comment: Mapped[str|None]=mapped_column(Text,nullable=True); status: Mapped[ClientStatus]=mapped_column(SAEnum(ClientStatus),default=ClientStatus.PENDING); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc))
class Order(Base):
    __tablename__="orders"; id: Mapped[UUID]=mapped_column(primary_key=True,default=uuid4); number: Mapped[str]=mapped_column(String(30),unique=True); client_name: Mapped[str]=mapped_column(String(180)); status: Mapped[OrderStatus]=mapped_column(SAEnum(OrderStatus),default=OrderStatus.NEW); total: Mapped[float]=mapped_column(Float,default=0); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc))
class ProductOut(BaseModel):
    model_config=ConfigDict(from_attributes=True); id: UUID; slug:str; name:str; style:str; description:str; abv:float; ibu:int; price:float; wholesale_price:float; stock_quantity:int; image_url:str
class WholesaleIn(BaseModel):
    company:str=Field(min_length=2,max_length=180); contact_name:str=Field(min_length=2,max_length=180); phone:str=Field(min_length=6,max_length=50); telegram:str|None=None; email:EmailStr; city:str; business_type:str; outlets:int=Field(default=1,ge=1,le=10000); comment:str|None=Field(default=None,max_length=2000)
class OrderIn(BaseModel): client_name:str=Field(min_length=2,max_length=180); total:float=Field(gt=0)
def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()
def seed(db:Session):
    categories = {item.slug: item for item in db.scalars(select(Category)).all()}
    for slug, name in [("ipa", "IPA"), ("lager", "Lager"), ("porter", "Porter"), ("stout", "Stout"), ("wheat", "Wheat")]:
        if slug not in categories:
            categories[slug] = Category(slug=slug, name=name); db.add(categories[slug])
    db.flush()
    items = [
      ("vtulka-american-ipa", "Vtulka", "American IPA", "IPA в американському стилі на хмелях Citra, Ahtanum, Simcoe та Chinook. Цитрусово-тропічний, збалансований і сухий IPA з характером.", 5.7, 45, 80, 56, 220, "ipa", "https://mbrew.com.ua/wp-content/uploads/2020/02/1-vtulka-600x450.jpg"),
      ("friday-out-porter", "Friday Out", "Porter", "Портер на американських хмелях Warrior та Cascade: смажена кава, гіркий шоколад, печиво та сухий фініш.", 10.5, 60, 77, 54, 160, "porter", "https://mbrew.com.ua/wp-content/uploads/2020/02/5-friday-out-600x450.jpg"),
      ("crash-of-imperial-stout", "Crash OF", "Imperial Stout", "Темний міцний імператорський стаут із кавово-шоколадним характером та паленим і карамельним солодом.", 10.0, 55, 85, 60, 120, "stout", "https://mbrew.com.ua/wp-content/uploads/2025/02/5-crashof-300x300.jpg"),
      ("see-the-sea-lager", "See the sea", "Lager", "Класичний світлий лагер із чистим нейтральним профілем і м’якою гіркотою.", 4.8, 18, 54, 38, 300, "lager", ""),
      ("a-little-bit-weet", "A little bit weet", "Witbier", "Освіжаючий бельгійський пшеничний ель із цедрою апельсина, коріандром, пшеничними та вівсяними пластівцями.", 5.0, 14, 69, 48, 180, "wheat", ""),
    ]
    existing = {item.slug: item for item in db.scalars(select(Product)).all()}
    for slug, name, style, description, abv, ibu, price, wholesale_price, stock, category, image_url in items:
        data = dict(name=name, style=style, description=description, abv=abv, ibu=ibu, price=price, wholesale_price=wholesale_price, stock_quantity=stock, image_url=image_url, category_id=categories[category].id)
        if slug in existing:
            for key, value in data.items(): setattr(existing[slug], key, value)
        else: db.add(Product(slug=slug, **data))
    for old_slug in ("tropical-ipa", "golden-lager"):
        if old := existing.get(old_slug): db.delete(old)
    db.commit()
@asynccontextmanager
async def lifespan(app:FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db: seed(db)
    yield
app=FastAPI(title="ПИВО МЕХАНІК API",version="0.1.0",lifespan=lifespan,openapi_url="/openapi.json",docs_url="/docs")
app.add_middleware(CORSMiddleware,allow_origins=[x.strip() for x in settings.allowed_origins.split(",")],allow_credentials=True,allow_methods=["GET","POST","PATCH"],allow_headers=["*"])
@app.get("/health")
@app.get("/api/health")
def health(): return {"status":"ok"}
@app.get("/api/products",response_model=list[ProductOut])
def products(db:Session=Depends(get_db)): return db.scalars(select(Product).order_by(Product.name)).all()
@app.get("/api/products/{slug}",response_model=ProductOut)
def product(slug:str,db:Session=Depends(get_db)):
    item=db.scalar(select(Product).where(Product.slug==slug))
    if not item: raise HTTPException(404,"Product not found")
    return item
@app.get("/api/categories")
def categories(db:Session=Depends(get_db)): return [{"id":str(x.id),"slug":x.slug,"name":x.name} for x in db.scalars(select(Category)).all()]
@app.post("/api/wholesale/applications",status_code=status.HTTP_201_CREATED)
def wholesale(data:WholesaleIn,db:Session=Depends(get_db)):
    item=WholesaleApplication(**data.model_dump()); db.add(item); db.commit(); return {"id":str(item.id),"status":item.status}
@app.post("/api/orders",status_code=status.HTTP_201_CREATED)
def create_order(data:OrderIn,db:Session=Depends(get_db)):
    number=f"B2B-{datetime.now().year}-{db.query(Order).count()+1:05d}"; item=Order(number=number,**data.model_dump()); db.add(item); db.commit(); return {"id":str(item.id),"number":number,"status":item.status}
@app.patch("/api/orders/{order_id}/status")
def update_order(order_id:UUID,new_status:OrderStatus,db:Session=Depends(get_db)):
    item=db.get(Order,order_id)
    if not item: raise HTTPException(404,"Order not found")
    item.status=new_status; db.commit(); return {"number":item.number,"status":item.status}
@app.post("/api/telegram/webhook/{bot_id}")
async def telegram_webhook(bot_id:UUID,request:Request,x_telegram_bot_api_secret_token:str|None=Header(default=None)):
    if not hmac.compare_digest(x_telegram_bot_api_secret_token or "",settings.telegram_webhook_secret): raise HTTPException(403,"Invalid webhook secret")
    update=await request.json(); return {"ok":True,"bot_id":str(bot_id),"update_id":update.get("update_id")}
