from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# =================== MODELS ===================

class BalanceDevice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # "BMS_ASISTIDA", "AUTOSERVICIO", "IA"
    status: str = "online"  # online, offline, maintenance
    firmware_version: str = "v2.3.1"
    last_calibration: str
    installation_date: str
    avg_consumption: float  # kWh per day
    label_status: str = "good"  # good, warning, replace
    printhead_life: int  # percentage

class Store(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    comuna: str
    sap_code: str
    address: str
    latitude: float
    longitude: float
    status: str  # "online", "partial", "offline"
    balances_bms: int
    balances_autoservicio: int
    balances_ia: int
    last_update: str
    network_status: str = "connected"
    latency: int  # ms
    sales_level: str = "high"  # high, medium, low
    devices: List[BalanceDevice] = []

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    start_date: str
    end_date: str
    status: str  # active, scheduled, expired
    wallpaper_url: str
    deployed_count: int = 0
    total_balances: int = 0
    stores_applied: List[str] = []

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    store_id: str
    store_name: str
    type: str  # calibration, maintenance, firmware
    message: str
    priority: str  # high, medium, low
    created_at: str
    resolved: bool = False

class Metrics(BaseModel):
    total_kg_today: float
    active_balances: int
    calibration_percentage: float
    pending_updates: int
    stores_online: int
    stores_partial: int
    stores_offline: int

class WeightData(BaseModel):
    product: str
    weights: List[float]
    dates: List[str]

class AIPrediction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str  # maintenance, supply, fraud, optimization, etc.
    priority: str  # high, medium, low
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    store_name: str
    store_comuna: str
    store_address: str
    sap_code: str
    issue: str
    description: str
    reported_to: str  # "Alcom" or "Servicio Técnico"
    status: str = "Pendiente"  # Pendiente, En Proceso, Resuelto
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    assigned_to: Optional[str] = None

# =================== INITIAL DATA GENERATION ===================

SANTIAGO_COMUNAS = [
    {"name": "Las Condes", "lat": -33.4172, "lon": -70.5838},
    {"name": "Providencia", "lat": -33.4269, "lon": -70.6103},
    {"name": "Vitacura", "lat": -33.3820, "lon": -70.5754},
    {"name": "Santiago Centro", "lat": -33.4489, "lon": -70.6693},
    {"name": "Ñuñoa", "lat": -33.4564, "lon": -70.5989},
    {"name": "La Reina", "lat": -33.4450, "lon": -70.5404},
    {"name": "Maipú", "lat": -33.5115, "lon": -70.7581},
    {"name": "Pudahuel", "lat": -33.4403, "lon": -70.7460},
    {"name": "Cerrillos", "lat": -33.4974, "lon": -70.7093},
    {"name": "Estación Central", "lat": -33.4596, "lon": -70.6989},
    {"name": "La Florida", "lat": -33.5282, "lon": -70.5985},
    {"name": "Puente Alto", "lat": -33.6110, "lon": -70.5756},
    {"name": "San Miguel", "lat": -33.4969, "lon": -70.6513},
    {"name": "La Cisterna", "lat": -33.5323, "lon": -70.6620},
    {"name": "El Bosque", "lat": -33.5625, "lon": -70.6756},
    {"name": "San Bernardo", "lat": -33.5926, "lon": -70.7009},
    {"name": "Quilicura", "lat": -33.3608, "lon": -70.7342},
    {"name": "Renca", "lat": -33.4044, "lon": -70.7212},
    {"name": "Independencia", "lat": -33.4164, "lon": -70.6643},
    {"name": "Recoleta", "lat": -33.4029, "lon": -70.6399},
    {"name": "Conchalí", "lat": -33.3835, "lon": -70.6717},
    {"name": "Huechuraba", "lat": -33.3695, "lon": -70.6369},
    {"name": "Macul", "lat": -33.4850, "lon": -70.5990},
    {"name": "Peñalolén", "lat": -33.4896, "lon": -70.5428},
    {"name": "La Granja", "lat": -33.5383, "lon": -70.6220},
    {"name": "San Joaquín", "lat": -33.4975, "lon": -70.6297},
    {"name": "Pedro Aguirre Cerda", "lat": -33.4868, "lon": -70.6741},
    {"name": "Lo Prado", "lat": -33.4440, "lon": -70.7243},
    {"name": "Cerro Navia", "lat": -33.4236, "lon": -70.7417},
    {"name": "Quinta Normal", "lat": -33.4345, "lon": -70.6937},
    {"name": "Lo Espejo", "lat": -33.5225, "lon": -70.6897},
    {"name": "San Ramón", "lat": -33.5363, "lon": -70.6481},
    {"name": "La Pintana", "lat": -33.5833, "lon": -70.6344},
    {"name": "Lo Barnechea", "lat": -33.3486, "lon": -70.5091},
    {"name": "Colina", "lat": -33.2017, "lon": -70.6755},
    {"name": "Lampa", "lat": -33.2896, "lon": -70.8780},
    {"name": "Talagante", "lat": -33.6631, "lon": -70.9294},
    {"name": "Buin", "lat": -33.7326, "lon": -70.7429},
    {"name": "Paine", "lat": -33.8124, "lon": -70.7439},
    {"name": "Melipilla", "lat": -33.6875, "lon": -71.2148}
]

def generate_device(device_type: str) -> BalanceDevice:
    statuses = ["online"] * 8 + ["offline"] * 1 + ["maintenance"] * 1
    return BalanceDevice(
        type=device_type,
        status=random.choice(statuses),
        firmware_version=random.choice(["v2.3.1", "v2.3.0", "v2.2.5"]),
        last_calibration=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))).isoformat(),
        installation_date=(datetime.now(timezone.utc) - timedelta(days=random.randint(180, 1095))).isoformat(),
        avg_consumption=round(random.uniform(0.5, 2.5), 2),
        label_status=random.choice(["good"] * 8 + ["warning"] * 1 + ["replace"] * 1),
        printhead_life=random.randint(60, 100)
    )

async def initialize_data():
    # Check if data already exists
    existing_stores = await db.stores.count_documents({})
    if existing_stores > 0:
        return
    
    stores = []
    for i, comuna_data in enumerate(SANTIAGO_COMUNAS[:20]):  # Limit to 20 stores
        bms_count = random.randint(2, 4)  # Reduced range
        auto_count = random.randint(1, 3)  # Reduced range
        ia_count = random.randint(1, 2)    # Reduced range
        
        devices = []
        for _ in range(bms_count):
            devices.append(generate_device("BMS_ASISTIDA"))
        for _ in range(auto_count):
            devices.append(generate_device("AUTOSERVICIO"))
        for _ in range(ia_count):
            devices.append(generate_device("IA"))
        
        # Determine store status based on device statuses
        online_devices = sum(1 for d in devices if d.status == "online")
        total_devices = len(devices)
        if online_devices == total_devices:
            status = "online"
        elif online_devices > total_devices * 0.5:
            status = "partial"
        else:
            status = "offline"
        
        store = Store(
            name=f"Local {i+1}",
            comuna=comuna_data["name"],
            sap_code=f"SAP-{1000 + i}",
            address=f"Av. Principal {100 + i*10}, {comuna_data['name']}",
            latitude=comuna_data["lat"] + random.uniform(-0.01, 0.01),
            longitude=comuna_data["lon"] + random.uniform(-0.01, 0.01),
            status=status,
            balances_bms=bms_count,
            balances_autoservicio=auto_count,
            balances_ia=ia_count,
            last_update=datetime.now(timezone.utc).isoformat(),
            network_status=random.choice(["connected"] * 9 + ["unstable"]),
            latency=random.randint(10, 80),
            sales_level=random.choice(["high"] * 3 + ["medium"] * 5 + ["low"] * 2),
            devices=[d.dict() for d in devices]
        )
        stores.append(store.dict())
    
    await db.stores.insert_many(stores)
    
    # Create sample campaigns
    campaigns = [
        Campaign(
            name="Navidad 2024",
            start_date="2024-12-01",
            end_date="2024-12-31",
            status="expired",
            wallpaper_url="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
            deployed_count=20,
            total_balances=20
        ),
        Campaign(
            name="Verano Saludable 2025",
            start_date="2025-01-15",
            end_date="2025-03-15",
            status="active",
            wallpaper_url="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800",
            deployed_count=18,
            total_balances=20,
            stores_applied=[s["id"] for s in stores[:18]]
        ),
        Campaign(
            name="Otoño Promociones",
            start_date="2025-04-01",
            end_date="2025-05-31",
            status="scheduled",
            wallpaper_url="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            deployed_count=0,
            total_balances=20
        ),
        Campaign(
            name="Modo Fiesta 18 de Septiembre",
            start_date="2025-09-15",
            end_date="2025-09-20",
            status="scheduled",
            wallpaper_url="https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800",
            deployed_count=0,
            total_balances=20
        )
    ]
    await db.campaigns.insert_many([c.dict() for c in campaigns])
    
    # Create alerts
    alerts = []
    for i, store in enumerate(stores[:10]):
        if i % 3 == 0:
            alerts.append(Alert(
                store_id=store["id"],
                store_name=f"{store['name']} - {store['comuna']}",
                type="calibration",
                message="Calibración trimestral pendiente",
                priority="medium",
                created_at=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))).isoformat(),
                resolved=False
            ).dict())
        elif i % 3 == 1:
            alerts.append(Alert(
                store_id=store["id"],
                store_name=f"{store['name']} - {store['comuna']}",
                type="maintenance",
                message="Mantenimiento preventivo requerido",
                priority="high",
                created_at=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 5))).isoformat(),
                resolved=False
            ).dict())
    
    if alerts:
        await db.alerts.insert_many(alerts)

# =================== API ENDPOINTS ===================

@api_router.get("/")
async def root():
    return {"message": "BM MANAGER API v1.0"}

@api_router.get("/stores", response_model=List[Store])
async def get_stores():
    stores = await db.stores.find().to_list(1000)
    return [Store(**store) for store in stores]

@api_router.get("/stores/{store_id}", response_model=Store)
async def get_store(store_id: str):
    store = await db.stores.find_one({"id": store_id})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return Store(**store)

@api_router.put("/stores/{store_id}")
async def update_store(store_id: str, store_data: dict):
    result = await db.stores.update_one(
        {"id": store_id},
        {"$set": store_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"success": True}

@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns():
    campaigns = await db.campaigns.find().to_list(1000)
    return [Campaign(**campaign) for campaign in campaigns]

@api_router.post("/campaigns", response_model=Campaign)
async def create_campaign(campaign: Campaign):
    await db.campaigns.insert_one(campaign.dict())
    return campaign

@api_router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign_data: dict):
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": campaign_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"success": True}

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts():
    alerts = await db.alerts.find({"resolved": False}).to_list(1000)
    return [Alert(**alert) for alert in alerts]

@api_router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"resolved": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True}

@api_router.get("/metrics", response_model=Metrics)
async def get_metrics():
    stores = await db.stores.find().to_list(1000)
    
    total_balances = sum(s["balances_bms"] + s["balances_autoservicio"] + s["balances_ia"] for s in stores)
    active_balances = 0
    calibrated_count = 0
    total_devices = 0
    
    for store in stores:
        for device in store.get("devices", []):
            total_devices += 1
            if device["status"] == "online":
                active_balances += 1
            # Check if calibrated within last 90 days
            last_cal = datetime.fromisoformat(device["last_calibration"])
            if (datetime.now(timezone.utc) - last_cal).days <= 90:
                calibrated_count += 1
    
    stores_online = sum(1 for s in stores if s["status"] == "online")
    stores_partial = sum(1 for s in stores if s["status"] == "partial")
    stores_offline = sum(1 for s in stores if s["status"] == "offline")
    
    return Metrics(
        total_kg_today=round(random.uniform(15000, 25000), 2),
        active_balances=active_balances,
        calibration_percentage=round((calibrated_count / total_devices * 100) if total_devices > 0 else 0, 1),
        pending_updates=random.randint(3, 12),
        stores_online=stores_online,
        stores_partial=stores_partial,
        stores_offline=stores_offline
    )

@api_router.get("/weight-data", response_model=List[WeightData])
async def get_weight_data():
    # Generate sample weekly data for 3 products
    base_date = datetime.now(timezone.utc) - timedelta(days=6)
    dates = [(base_date + timedelta(days=i)).strftime("%d/%m") for i in range(7)]
    
    products = [
        {"product": "Tomate", "base": 450, "variance": 80},
        {"product": "Palta", "base": 320, "variance": 60},
        {"product": "Plátano", "base": 580, "variance": 100}
    ]
    
    result = []
    for p in products:
        weights = [round(p["base"] + random.uniform(-p["variance"], p["variance"]), 1) for _ in range(7)]
        result.append(WeightData(product=p["product"], weights=weights, dates=dates))
    
    return result

@api_router.post("/fix-naming")
async def fix_naming_issue():
    """Fix the persistent Sucursal to Local naming issue"""
    try:
        # Update all stores to use "Local" instead of "Sucursal" in name field
        result = await db.stores.update_many(
            {"name": {"$regex": "Sucursal"}},
            [{"$set": {"name": {"$replaceAll": {"input": "$name", "find": "Sucursal", "replacement": "Local"}}}}]
        )
        
        # Also regenerate data with proper naming
        await db.stores.delete_many({})
        await initialize_data_fixed()
        
        return {"success": True, "message": f"Updated {result.modified_count} stores with correct naming"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing naming: {str(e)}")

@api_router.get("/ai-predictions", response_model=List[AIPrediction])
async def get_ai_predictions():
    """Get AI-generated predictions based on system data"""
    try:
        # Get system data for context
        stores = await db.stores.find().to_list(1000)
        
        # Create context for AI
        total_stores = len(stores)
        offline_stores = len([s for s in stores if s["status"] == "offline"])
        problematic_devices = 0
        total_devices = 0
        
        for store in stores:
            for device in store.get("devices", []):
                total_devices += 1
                if device["status"] in ["offline", "maintenance"] or device["label_status"] == "replace":
                    problematic_devices += 1
        
        context = f"""Sistema BM MANAGER - Datos actuales:
- Total locales: {total_stores}
- Locales offline: {offline_stores}
- Dispositivos con problemas: {problematic_devices} de {total_devices}
- Es temporada de invierno (junio-agosto) en Chile
- Consumo diario estimado: 615 rollos de papel térmico
- Stock actual: 8000 rollos económicos
- Próxima calibración programada: 10 marzo 2025
"""
        
        # Initialize LLM client
        llm_chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"ai-predictions-{datetime.now().strftime('%Y%m%d')}",
            system_message="Eres un asistente de IA especializado en análisis predictivo para sistemas de balanzas de supermercados Walmart en Chile. Generas insights valiosos basados en datos del sistema."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""{context}

Genera 5 predicciones/sugerencias relevantes y accionables para el sistema BM MANAGER. Cada predicción debe:
- Ser específica y basada en los datos proporcionados
- Incluir números/métricas cuando sea apropiado
- Ser útil para la operación diaria
- Estar en español chileno

Formato requerido (JSON):
[
  {{
    "title": "Título conciso",
    "content": "Descripción detallada con métricas específicas",
    "category": "maintenance/supply/fraud/optimization/seasonal",
    "priority": "high/medium/low"
  }}
]"""

        user_message = UserMessage(text=prompt)
        response = await llm_chat.send_message(user_message)
        
        # Try to parse JSON response, fallback to predefined predictions if needed
        try:
            import json
            predictions_data = json.loads(response.strip())
            predictions = []
            for pred in predictions_data:
                predictions.append(AIPrediction(**pred))
        except:
            # Fallback to predefined predictions
            predictions = get_fallback_predictions()
        
        return predictions[:5]
        
    except Exception as e:
        logger.error(f"Error generating AI predictions: {str(e)}")
        # Return fallback predictions on error
        return get_fallback_predictions()

def get_fallback_predictions():
    """Fallback predictions when AI is unavailable"""
    return [
        AIPrediction(
            title="Preparación Temporada Alta",
            content="Faltan 50 días para Navidad. Estimamos que se necesitarán ~5,000 rollos de papel térmico adicionales para cubrir el incremento del 30% en ventas de frutas. Programa tu compra con anticipación.",
            category="seasonal",
            priority="high"
        ),
        AIPrediction(
            title="Mantenimiento Preventivo",
            content="La próxima calibración general está programada para el 10 de marzo de 2025. Te recomendamos adelantar mantenciones preventivas antes del 15 de noviembre para evitar paradas en temporada alta.",
            category="maintenance",
            priority="medium"
        ),
        AIPrediction(
            title="Alerta de Stock Crítico",
            content="El consumo diario de rollos es de 615 unidades y el stock de rollos económicos es de 8,000. Se prevé que se agotará en 13 días. Considera ordenar 10,000 rollos adicionales.",
            category="supply",
            priority="high"
        ),
        AIPrediction(
            title="Optimización Autoservicio",
            content="El tiempo promedio de pesaje por cliente es de 25–30s. Revisar layouts y capacitaciones podría reducirlo a 20s, aumentando la capacidad de atención en horas punta.",
            category="optimization",
            priority="medium"
        ),
        AIPrediction(
            title="Detección de Anomalías",
            content="En el local Recoleta se registran muchas mediciones de 335g, equivalentes a una lata de refresco. Podría indicar fraude en autoservicio; revisa cámaras y refuerza la supervisión.",
            category="fraud",
            priority="high"
        )
    ]

@api_router.post("/tickets", response_model=Ticket)
async def create_ticket(ticket_data: dict):
    """Create a new support ticket"""
    try:
        ticket = Ticket(**ticket_data)
        await db.tickets.insert_one(ticket.dict())
        return ticket
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating ticket: {str(e)}")

@api_router.get("/tickets", response_model=List[Ticket])
async def get_tickets():
    """Get all support tickets"""
    try:
        tickets = await db.tickets.find().sort("created_at", -1).to_list(1000)
        return [Ticket(**ticket) for ticket in tickets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tickets: {str(e)}")

async def initialize_data_fixed():
    """Initialize data with correct naming (Local instead of Sucursal)"""
    # Check if data already exists
    existing_stores = await db.stores.count_documents({})
    if existing_stores > 0:
        return
    
    stores = []
    for i, comuna_data in enumerate(SANTIAGO_COMUNAS[:20]):  # Limit to 20 stores
        bms_count = random.randint(2, 4)  # Reduced range
        auto_count = random.randint(1, 3)  # Reduced range
        ia_count = random.randint(1, 2)    # Reduced range
        
        devices = []
        for _ in range(bms_count):
            devices.append(generate_device("BMS_ASISTIDA"))
        for _ in range(auto_count):
            devices.append(generate_device("AUTOSERVICIO"))
        for _ in range(ia_count):
            devices.append(generate_device("IA"))
        
        # Determine store status based on device statuses
        online_devices = sum(1 for d in devices if d.status == "online")
        total_devices = len(devices)
        if online_devices == total_devices:
            status = "online"
        elif online_devices > total_devices * 0.5:
            status = "partial"
        else:
            status = "offline"
        
        store = Store(
            name=f"Local {i+1}",  # Changed from "Sucursal" to "Local"
            comuna=comuna_data["name"],
            sap_code=f"SAP-{1000 + i}",
            address=f"Av. Principal {100 + i*10}, {comuna_data['name']}",
            latitude=comuna_data["lat"] + random.uniform(-0.01, 0.01),
            longitude=comuna_data["lon"] + random.uniform(-0.01, 0.01),
            status=status,
            balances_bms=bms_count,
            balances_autoservicio=auto_count,
            balances_ia=ia_count,
            last_update=datetime.now(timezone.utc).isoformat(),
            network_status=random.choice(["connected"] * 9 + ["unstable"]),
            latency=random.randint(10, 80),
            sales_level=random.choice(["high"] * 3 + ["medium"] * 5 + ["low"] * 2),
            devices=[d.dict() for d in devices]
        )
        stores.append(store.dict())
    
    await db.stores.insert_many(stores)
    
    # Create sample campaigns (same as before)
    campaigns = [
        Campaign(
            name="Navidad 2024",
            start_date="2024-12-01",
            end_date="2024-12-31",
            status="expired",
            wallpaper_url="https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800",
            deployed_count=20,
            total_balances=20
        ),
        Campaign(
            name="Verano Saludable 2025",
            start_date="2025-01-15",
            end_date="2025-03-15",
            status="active",
            wallpaper_url="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800",
            deployed_count=18,
            total_balances=20,
            stores_applied=[s["id"] for s in stores[:18]]
        ),
        Campaign(
            name="Otoño Promociones",
            start_date="2025-04-01",
            end_date="2025-05-31",
            status="scheduled",
            wallpaper_url="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            deployed_count=0,
            total_balances=20
        )
    ]
    await db.campaigns.insert_many([c.dict() for c in campaigns])
    
    # Create alerts (same as before)
    alerts = []
    for i, store in enumerate(stores[:10]):
        if i % 3 == 0:
            alerts.append(Alert(
                store_id=store["id"],
                store_name=f"{store['name']} - {store['comuna']}",
                type="calibration",
                message="Calibración trimestral pendiente",
                priority="medium",
                created_at=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))).isoformat(),
                resolved=False
            ).dict())
        elif i % 3 == 1:
            alerts.append(Alert(
                store_id=store["id"],
                store_name=f"{store['name']} - {store['comuna']}",
                type="maintenance",
                message="Mantenimiento preventivo requerido",
                priority="high",
                created_at=(datetime.now(timezone.utc) - timedelta(days=random.randint(1, 5))).isoformat(),
                resolved=False
            ).dict())
    
    if alerts:
        await db.alerts.insert_many(alerts)

@app.on_event("startup")
async def startup_event():
    await initialize_data_fixed()
    logger.info("Database initialized with sample data (Local naming fixed)")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()