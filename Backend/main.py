from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pgmpy.models import BayesianNetwork
from pgmpy.inference import VariableElimination
from pgmpy.factors.discrete import TabularCPD
import numpy as np
from typing import List, Optional # 🔥 NUEVO: Se agrega Optional
from datetime import datetime

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = "postgresql+psycopg2://postgres:root@localhost:5432/prototipo_tesis"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ConsultaDB(Base):
    __tablename__ = "consultas_inversion"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.now)
    tipo_producto = Column(String)
    capital = Column(Float)
    experiencia = Column(String)
    temporada = Column(String)
    ubicacion = Column(String)
    origen = Column(String)
    calidad = Column(String)
    ganancia_estimada = Column(Float)
    tiempo_recuperacion_dias = Column(Integer)
    recomendacion = Column(String)
    probabilidad = Column(Float)
    
    # 🔥 NUEVO: Campos para la validación del experto (nullable=True permite que sean vacíos si es un usuario nuevo)
    experiencia_real_rentabilidad = Column(String, nullable=True)
    experiencia_real_rotacion = Column(String, nullable=True)
    comentario_experto = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def crear_modelo_inversion():
    modelo = BayesianNetwork([
        ('TipoProducto', 'Demanda'),
        ('Temporada', 'Demanda'),
        ('Experiencia', 'Competencia'),
        ('Ubicacion', 'Competencia'),
        ('Origen', 'Calidad'),
        ('Calidad', 'Margen'),
        ('Capital', 'Rotacion'),
        ('Demanda', 'Rotacion'),
        ('Competencia', 'Riesgo'),
        ('Rotacion', 'Riesgo'),
        ('Rotacion', 'Rentabilidad'),
        ('Margen', 'Rentabilidad'),
        ('Rentabilidad', 'Recomendacion'),
        ('Riesgo', 'Recomendacion'),
    ])

    cpd_tipo = TabularCPD(variable='TipoProducto', variable_card=4,
        values=[[0.30], [0.25], [0.25], [0.20]],
        state_names={'TipoProducto': ['Chompas', 'Poleras', 'Calzado', 'Accesorios']})

    cpd_capital = TabularCPD(variable='Capital', variable_card=3,
        values=[[0.45], [0.35], [0.20]],
        state_names={'Capital': ['Bajo', 'Medio', 'Alto']})

    cpd_experiencia = TabularCPD(variable='Experiencia', variable_card=3,
        values=[[0.40], [0.35], [0.25]],
        state_names={'Experiencia': ['Ninguna', '1-2_anios', 'Mas_3_anios']})

    cpd_temporada = TabularCPD(variable='Temporada', variable_card=3,
        values=[[0.40], [0.25], [0.35]],
        state_names={'Temporada': ['Invierno', 'Verano', 'TodoAño']})

    cpd_ubicacion = TabularCPD(variable='Ubicacion', variable_card=3,
        values=[[0.50], [0.30], [0.20]],
        state_names={'Ubicacion': ['FeriaPrincipal', 'ZonaPeriferica', 'Online']})

    cpd_origen = TabularCPD(variable='Origen', variable_card=2,
        values=[[0.65], [0.35]],
        state_names={'Origen': ['Importado', 'Nacional']})

    cpd_calidad = TabularCPD(variable='Calidad', variable_card=2,
        values=[[0.40, 0.70], [0.60, 0.30]],
        evidence=['Origen'], evidence_card=[2],
        state_names={'Calidad': ['Primera', 'Segunda'], 'Origen': ['Importado', 'Nacional']})

    cpd_competencia = TabularCPD(variable='Competencia', variable_card=3,
        values=[
            [0.60, 0.50, 0.40, 0.50, 0.40, 0.30, 0.40, 0.30, 0.20],
            [0.30, 0.40, 0.40, 0.35, 0.40, 0.45, 0.35, 0.45, 0.50],
            [0.10, 0.10, 0.20, 0.15, 0.20, 0.25, 0.25, 0.25, 0.30]
        ],
        evidence=['Experiencia', 'Ubicacion'], evidence_card=[3, 3],
        state_names={'Competencia': ['Alta', 'Media', 'Baja'], 
                     'Experiencia': ['Ninguna', '1-2_anios', 'Mas_3_anios'],
                     'Ubicacion': ['FeriaPrincipal', 'ZonaPeriferica', 'Online']})

    cpd_demanda = TabularCPD(variable='Demanda', variable_card=3,
        values=[
            [0.85, 0.40, 0.60, 0.70, 0.50, 0.60, 0.60, 0.30, 0.50, 0.50, 0.40, 0.50],
            [0.12, 0.45, 0.30, 0.22, 0.35, 0.30, 0.28, 0.45, 0.35, 0.35, 0.40, 0.35],
            [0.03, 0.15, 0.10, 0.08, 0.15, 0.10, 0.12, 0.25, 0.15, 0.15, 0.20, 0.15]
        ],
        evidence=['TipoProducto', 'Temporada'], evidence_card=[4, 3],
        state_names={'Demanda': ['Alta', 'Media', 'Baja'], 
                     'TipoProducto': ['Chompas', 'Poleras', 'Calzado', 'Accesorios'],
                     'Temporada': ['Invierno', 'Verano', 'TodoAño']})

    cpd_rotacion = TabularCPD(variable='Rotacion', variable_card=3,
        values=[
            [0.70, 0.40, 0.20, 0.50, 0.30, 0.15, 0.30, 0.20, 0.10],
            [0.20, 0.40, 0.35, 0.35, 0.45, 0.40, 0.40, 0.45, 0.35],
            [0.10, 0.20, 0.45, 0.15, 0.25, 0.45, 0.30, 0.35, 0.55]
        ],
        evidence=['Demanda', 'Capital'], evidence_card=[3, 3],
        state_names={'Rotacion': ['Rapida', 'Media', 'Lenta'], 'Demanda': ['Alta', 'Media', 'Baja'], 'Capital': ['Bajo', 'Medio', 'Alto']})

    cpd_margen = TabularCPD(variable='Margen', variable_card=3,
        values=[
            [0.70, 0.30],
            [0.25, 0.50],
            [0.05, 0.20]
        ],
        evidence=['Calidad'], evidence_card=[2],
        state_names={'Margen': ['Alto', 'Medio', 'Bajo'], 'Calidad': ['Primera', 'Segunda']})

    cpd_riesgo = TabularCPD(variable='Riesgo', variable_card=3,
        values=[
            [0.20, 0.40, 0.60, 0.30, 0.50, 0.70, 0.40, 0.60, 0.80],
            [0.40, 0.40, 0.30, 0.45, 0.35, 0.25, 0.45, 0.30, 0.15],
            [0.40, 0.20, 0.10, 0.25, 0.15, 0.05, 0.15, 0.10, 0.05]
        ],
        evidence=['Competencia', 'Rotacion'], evidence_card=[3, 3],
        state_names={'Riesgo': ['Bajo', 'Medio', 'Alto'], 'Competencia': ['Alta', 'Media', 'Baja'], 'Rotacion': ['Rapida', 'Media', 'Lenta']})

    cpd_rentabilidad = TabularCPD(variable='Rentabilidad', variable_card=3,
        values=[
            [0.80, 0.50, 0.40, 0.20, 0.20, 0.10, 0.15, 0.10, 0.05],
            [0.15, 0.35, 0.40, 0.40, 0.50, 0.40, 0.35, 0.40, 0.35],
            [0.05, 0.15, 0.20, 0.40, 0.30, 0.50, 0.50, 0.50, 0.60]
        ],
        evidence=['Rotacion', 'Margen'], evidence_card=[3, 3],
        state_names={'Rentabilidad': ['Alta', 'Media', 'Baja'], 'Rotacion': ['Rapida', 'Media', 'Lenta'], 'Margen': ['Alto', 'Medio', 'Bajo']})

    cpd_recomendacion = TabularCPD(variable='Recomendacion', variable_card=3,
        values=[
            [0.90, 0.60, 0.20, 0.70, 0.30, 0.10, 0.40, 0.15, 0.05],
            [0.09, 0.35, 0.50, 0.25, 0.50, 0.40, 0.45, 0.50, 0.40],
            [0.01, 0.05, 0.30, 0.05, 0.20, 0.50, 0.15, 0.35, 0.55]
        ],
        evidence=['Rentabilidad', 'Riesgo'], evidence_card=[3, 3],
        state_names={'Recomendacion': ['Muy_Conveniente', 'Con_Prevision', 'No_Recomendable'], 
                     'Rentabilidad': ['Alta', 'Media', 'Baja'], 'Riesgo': ['Bajo', 'Medio', 'Alto']})

    modelo.add_cpds(cpd_tipo, cpd_capital, cpd_experiencia, cpd_temporada, cpd_ubicacion, 
                    cpd_origen, cpd_calidad, cpd_competencia, cpd_demanda, cpd_rotacion, 
                    cpd_margen, cpd_riesgo, cpd_rentabilidad, cpd_recomendacion)
    
    assert modelo.check_model(), "Error en el modelo bayesiano"
    return modelo

modelo_inversion = crear_modelo_inversion()
inferencia = VariableElimination(modelo_inversion)

PROVEEDORES = {
    'Chompas': [{'nombre': 'Gamarra (Perú)', 'ubicacion': 'Lima, Perú', 'precio_mayorista': 35, 'tiempo_entrega': 7}],
    'Poleras': [{'nombre': 'Gamarra (Perú)', 'ubicacion': 'Lima, Perú', 'precio_mayorista': 15, 'tiempo_entrega': 7}],
    'Calzado': [{'nombre': 'Cobija', 'ubicacion': 'Cobija, Bolivia', 'precio_mayorista': 40, 'tiempo_entrega': 5}],
    'Accesorios': [{'nombre': 'China', 'ubicacion': 'Guangzhou, China', 'precio_mayorista': 5, 'tiempo_entrega': 20}],
}

MARGENES = {'Chompas': 0.80, 'Poleras': 0.70, 'Calzado': 0.60, 'Accesorios': 1.20}
TIEMPO_VENTA = {'Rapida': 7, 'Media': 21, 'Lenta': 45}
PRECIO_PROMEDIO = {'Chompas': 40, 'Poleras': 20, 'Calzado': 50, 'Accesorios': 10}

class ConsultaRequest(BaseModel):
    tipo_producto: str
    capital: float
    experiencia: str
    temporada: str
    ubicacion: str
    origen: str
    calidad: str
    # 🔥 NUEVO: Campos opcionales para la validación del experto
    experiencia_real_rentabilidad: Optional[str] = None
    experiencia_real_rotacion: Optional[str] = None
    comentario_experto: Optional[str] = None

class ResultadoVariable(BaseModel):
    estado: str
    probabilidad: float

class Proveedor(BaseModel):
    nombre: str
    ubicacion: str
    precio_mayorista: float
    tiempo_entrega: int

class Proyeccion(BaseModel):
    capital_invertido: float
    ganancia_estimada: float
    tiempo_recuperacion_dias: int
    unidades_estimadas: int
    precio_venta_sugerido: float
    retorno_inversion: float

class ConsultaResponse(BaseModel):
    exito: bool
    mensaje: str
    recomendacion: str
    probabilidad_recomendacion: float
    rentabilidad: List[ResultadoVariable]
    riesgo: List[ResultadoVariable]
    rotacion: List[ResultadoVariable]
    demanda: List[ResultadoVariable]
    competencia: List[ResultadoVariable]
    margen_ganancia: List[ResultadoVariable]
    consejo: str
    proveedores: List[Proveedor]
    proyeccion: Proyeccion

app = FastAPI(
    title="Sistema de Apoyo a la Decisión para Jóvenes Emprendedores",
    description="Modelo bayesiano para evaluación de inversiones en el comercio informal",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"sistema": "Modelo de Apoyo a la Decisión", "caso": "Jóvenes Emprendedores", "version": "2.0.0", "estado": "activo"}

@app.post("/consultar", response_model=ConsultaResponse)
def consultar(consulta: ConsultaRequest, db: Session = Depends(get_db)):
    if consulta.tipo_producto not in ['Chompas', 'Poleras', 'Calzado', 'Accesorios']:
        raise HTTPException(status_code=400, detail="Tipo de producto no válido")
    if consulta.experiencia not in ['Ninguna', '1-2_anios', 'Mas_3_anios']:
        raise HTTPException(status_code=400, detail="Experiencia no válida")
    if consulta.temporada not in ['Invierno', 'Verano', 'TodoAño']:
        raise HTTPException(status_code=400, detail="Temporada no válida")
    if consulta.ubicacion not in ['FeriaPrincipal', 'ZonaPeriferica', 'Online']:
        raise HTTPException(status_code=400, detail="Ubicación no válida")
    if consulta.origen not in ['Importado', 'Nacional']:
        raise HTTPException(status_code=400, detail="Origen no válido")
    if consulta.calidad not in ['Primera', 'Segunda']:
        raise HTTPException(status_code=400, detail="Calidad no válida")

    if consulta.capital < 500: capital_nivel = 'Bajo'
    elif consulta.capital < 2000: capital_nivel = 'Medio'
    else: capital_nivel = 'Alto'

    evidencia = {
        'TipoProducto': consulta.tipo_producto,
        'Capital': capital_nivel,
        'Experiencia': consulta.experiencia,
        'Temporada': consulta.temporada,
        'Ubicacion': consulta.ubicacion,
        'Origen': consulta.origen,
        'Calidad': consulta.calidad
    }

    res_recomendacion = inferencia.query(variables=['Recomendacion'], evidence=evidencia)
    res_rentabilidad = inferencia.query(variables=['Rentabilidad'], evidence=evidencia)
    res_riesgo = inferencia.query(variables=['Riesgo'], evidence=evidencia)
    res_rotacion = inferencia.query(variables=['Rotacion'], evidence=evidencia)
    res_demanda = inferencia.query(variables=['Demanda'], evidence=evidencia)
    res_competencia = inferencia.query(variables=['Competencia'], evidence=evidencia)
    res_margen = inferencia.query(variables=['Margen'], evidence=evidencia)

    def extraer(factor_resultado, nombre_variable):
        valores = factor_resultado.values
        estados = factor_resultado.state_names[nombre_variable]
        return [ResultadoVariable(estado=estados[i], probabilidad=round(float(valores[i]) * 100, 2)) for i in range(len(valores))]

    rentabilidad = extraer(res_rentabilidad, 'Rentabilidad')
    riesgo = extraer(res_riesgo, 'Riesgo')
    rotacion = extraer(res_rotacion, 'Rotacion')
    demanda = extraer(res_demanda, 'Demanda')
    competencia = extraer(res_competencia, 'Competencia')
    margen = extraer(res_margen, 'Margen')

    rec_values = res_recomendacion.values
    estados_rec = res_recomendacion.state_names['Recomendacion']
    idx_mejor = int(np.argmax(rec_values))
    mejor_rec = estados_rec[idx_mejor]
    prob_mejor = round(float(rec_values[idx_mejor]) * 100, 2)

    margen_porcentaje = MARGENES[consulta.tipo_producto]
    rotacion_valores = res_rotacion.values
    rotacion_estados = res_rotacion.state_names['Rotacion']
    idx_rotacion = int(np.argmax(rotacion_valores))
    rotacion_mas_probable = rotacion_estados[idx_rotacion]
    
    tiempo_recuperacion = TIEMPO_VENTA[rotacion_mas_probable]
    ganancia_estimada = consulta.capital * margen_porcentaje
    precio_unitario = PRECIO_PROMEDIO[consulta.tipo_producto]
    unidades_estimadas = int(consulta.capital / precio_unitario)
    precio_venta = precio_unitario * (1 + margen_porcentaje)
    roi = (ganancia_estimada / consulta.capital) * 100

    proyeccion = Proyeccion(
        capital_invertido=consulta.capital,
        ganancia_estimada=round(ganancia_estimada, 2),
        tiempo_recuperacion_dias=tiempo_recuperacion,
        unidades_estimadas=unidades_estimadas,
        precio_venta_sugerido=round(precio_venta, 2),
        retorno_inversion=round(roi, 2)
    )

    proveedores_data = PROVEEDORES.get(consulta.tipo_producto, [])
    proveedores = [Proveedor(**p) for p in proveedores_data]

    consejo = f"Con Bs. {consulta.capital:.0f} en {consulta.tipo_producto} ({consulta.temporada}), podrías ganar Bs. {ganancia_estimada:.0f} en {tiempo_recuperacion} días vendiendo {unidades_estimadas} unidades."

    # 🔥 NUEVO: Guardar la validación del experto en la base de datos
    nueva_consulta = ConsultaDB(
        tipo_producto=consulta.tipo_producto, capital=consulta.capital,
        experiencia=consulta.experiencia, temporada=consulta.temporada,
        ubicacion=consulta.ubicacion, origen=consulta.origen, calidad=consulta.calidad,
        ganancia_estimada=ganancia_estimada, tiempo_recuperacion_dias=tiempo_recuperacion,
        recomendacion=mejor_rec, probabilidad=prob_mejor,
        experiencia_real_rentabilidad=consulta.experiencia_real_rentabilidad,
        experiencia_real_rotacion=consulta.experiencia_real_rotacion,
        comentario_experto=consulta.comentario_experto
    )
    db.add(nueva_consulta)
    db.commit()
    db.refresh(nueva_consulta)

    return ConsultaResponse(
        exito=True, mensaje="Análisis completado", recomendacion=mejor_rec,
        probabilidad_recomendacion=prob_mejor, rentabilidad=rentabilidad,
        riesgo=riesgo, rotacion=rotacion, demanda=demanda, competencia=competencia,
        margen_ganancia=margen, consejo=consejo, proveedores=proveedores, proyeccion=proyeccion
    )

@app.get("/historial")
def ver_historial(db: Session = Depends(get_db)):
    consultas = db.query(ConsultaDB).order_by(ConsultaDB.id.desc()).limit(20).all()
    historial = [{
        "id": c.id, "fecha": c.fecha.strftime("%Y-%m-%d %H:%M:%S"),
        "tipo_producto": c.tipo_producto, "capital": c.capital,
        "experiencia": c.experiencia, "temporada": c.temporada,
        "ubicacion": c.ubicacion, "ganancia_estimada": c.ganancia_estimada,
        "tiempo_recuperacion_dias": c.tiempo_recuperacion_dias,
        "recomendacion": c.recomendacion, "probabilidad": c.probabilidad,
        # 🔥 NUEVO: Incluir validación en el historial
        "experiencia_real_rentabilidad": c.experiencia_real_rentabilidad,
        "experiencia_real_rotacion": c.experiencia_real_rotacion,
        "comentario_experto": c.comentario_experto
    } for c in consultas]
    return {"total_registros": len(historial), "consultas": historial}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)