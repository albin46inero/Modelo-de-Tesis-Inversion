import streamlit as st
import requests
import plotly.graph_objects as go

# Configuración de la página
st.set_page_config(
    page_title="Sistema de Inversión - Jóvenes Emprendedores",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Estilos CSS personalizados
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 30px;
    }
    .main-header h1 { margin: 0; font-size: 2.2em; }
    .main-header p { margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.9; }
    .result-card {
        padding: 25px;
        border-radius: 15px;
        color: white;
        text-align: center;
        font-size: 1.8em;
        font-weight: bold;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Header principal
st.markdown("""
<div class="main-header">
    <h1> Sistema de Apoyo a la Decisión</h1>
    <p>Modelo Predictivo para Jóvenes Emprendedores</p>
    <small>Evaluación de Riesgos y Rentabilidad en Inversiones</small>
</div>
""", unsafe_allow_html=True)

# URL del backend
BACKEND_URL = "http://localhost:8000"

# Panel lateral con los formularios
with st.sidebar:
    st.header("️ Datos de la Inversión")
    st.markdown("---")
    
    tipo_producto = st.selectbox("📦 Tipo de Producto", ["Chompas", "Poleras", "Calzado", "Accesorios"])
    capital = st.number_input(" Capital a Invertir (Bs.)", min_value=100, value=2000, step=100)
    experiencia = st.selectbox("🎓 Experiencia", ["Ninguna", "1-2_anios", "Mas_3_anios"])
    temporada = st.selectbox("📅 Temporada", ["Invierno", "Verano", "TodoAño"])
    ubicacion = st.selectbox("📍 Ubicación", ["FeriaPrincipal", "ZonaPeriferica", "Online"])
    origen = st.selectbox("🌍 Origen", ["Importado", "Nacional"])
    calidad = st.selectbox("⭐ Calidad", ["Primera", "Segunda"])
    
    st.markdown("---")
    btn_analizar = st.button(" ANALIZAR INVERSIÓN", use_container_width=True, type="primary")

# Función para consultar al backend
def consultar_backend(tipo, cap, exp, temp, ubi, orig, cal):
    try:
        data = {
            "tipo_producto": tipo,
            "capital": cap,
            "experiencia": exp,
            "temporada": temp,
            "ubicacion": ubi,
            "origen": orig,
            "calidad": cal
        }
        response = requests.post(f"{BACKEND_URL}/consultar", json=data, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        st.error(f" Error de conexión: {e}")
        st.info("💡 Asegúrate de que el backend esté corriendo con: python main.py")
        return None

# Lógica principal
if btn_analizar:
    with st.spinner("🔄 El modelo bayesiano está calculando probabilidades..."):
        resultado = consultar_backend(tipo_producto, capital, experiencia, temporada, ubicacion, origen, calidad)
        
        if resultado and resultado["exito"]:
            rec = resultado["recomendacion"]
            prob = resultado["probabilidad_recomendacion"]
            
            # Colores según recomendación
            if rec == "Muy_Conveniente": color = "#28a745"
            elif rec == "Con_Prevision": color = "#ffc107"
            else: color = "#dc3545"
            
            # Tarjeta de recomendación
            st.markdown(f'<div class="result-card" style="background: {color};">{rec.replace("_", " ").upper()} ({prob}%)</div>', unsafe_allow_html=True)
            
            # Consejo personalizado
            st.success(f"💬 {resultado['consejo']}")
            
            # Proyección Financiera
            st.subheader("📊 Proyección Financiera")
            col1, col2, col3, col4 = st.columns(4)
            with col1:
                st.metric("💵 Ganancia Estimada", f"Bs. {resultado['proyeccion']['ganancia_estimada']:.0f}")
            with col2:
                st.metric("⏱️ Tiempo de Venta", f"{resultado['proyeccion']['tiempo_recuperacion_dias']} días")
            with col3:
                st.metric("📦 Unidades", f"{resultado['proyeccion']['unidades_estimadas']} un.")
            with col4:
                st.metric("📈 ROI", f"{resultado['proyeccion']['retorno_inversion']:.1f}%")
            
            # Proveedores
            st.subheader(" Proveedores Recomendados")
            for p in resultado["proveedores"]:
                st.info(f"**{p['nombre']}** ({p['ubicacion']}) - Precio mayorista: Bs. {p['precio_mayorista']} | Entrega: {p['tiempo_entrega']} días")
            
            # Gráficos
            st.subheader("📈 Análisis de Riesgos y Demanda")
            col_g1, col_g2, col_g3 = st.columns(3)
            
            with col_g1:
                fig = go.Figure(data=[go.Bar(
                    x=[r["estado"] for r in resultado["rentabilidad"]],
                    y=[r["probabilidad"] for r in resultado["rentabilidad"]],
                    marker_color=['#28a745', '#ffc107', '#dc3545'],
                    text=[f"{r['probabilidad']}%" for r in resultado["rentabilidad"]],
                    textposition='auto'
                )])
                fig.update_layout(title="💰 Rentabilidad", yaxis_title="% Probabilidad", height=300)
                st.plotly_chart(fig, use_container_width=True)
                
            with col_g2:
                fig2 = go.Figure(data=[go.Bar(
                    x=[r["estado"] for r in resultado["riesgo"]],
                    y=[r["probabilidad"] for r in resultado["riesgo"]],
                    marker_color=['#dc3545', '#ffc107', '#28a745'],
                    text=[f"{r['probabilidad']}%" for r in resultado["riesgo"]],
                    textposition='auto'
                )])
                fig2.update_layout(title="⚠️ Nivel de Riesgo", yaxis_title="% Probabilidad", height=300)
                st.plotly_chart(fig2, use_container_width=True)
                
            with col_g3:
                fig3 = go.Figure(data=[go.Bar(
                    x=[r["estado"] for r in resultado["competencia"]],
                    y=[r["probabilidad"] for r in resultado["competencia"]],
                    marker_color=['#dc3545', '#ffc107', '#28a745'],
                    text=[f"{r['probabilidad']}%" for r in resultado["competencia"]],
                    textposition='auto'
                )])
                fig3.update_layout(title="🏆 Nivel de Competencia", yaxis_title="% Probabilidad", height=300)
                st.plotly_chart(fig3, use_container_width=True)

        else:
            st.error("❌ No se pudo obtener el análisis. Verifica que el backend esté corriendo.")

else:
    st.info(" Selecciona los datos en el panel lateral y haz clic en 'ANALIZAR INVERSIÓN'")

# Footer
st.markdown("---")
st.caption("🎓 Sistema desarrollado con Python, FastAPI, PostgreSQL y Redes Bayesianas. © 2026 - Tesis de Investigación")