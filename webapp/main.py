from flask import Flask,render_template,request
from os import path
import pandas as pd
from webapp import auth
from webapp import vendor
from webapp.sqla import sqla
from webapp.login import login_manager
from flask_login import current_user, login_required
import config
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object(config.config['development'])
login_manager.init_app(app)
sqla.init_app(app)
CORS(app, origins = ['https://project-b2b-edexa.vercel.app','https://ptools.synapsis-rs.com/','https://www.edexa.com.co','www.edexa.com.co'],methods=['POST', 'GET', 'OPTIONS'])
app.register_blueprint(auth.bp)
app.register_blueprint(vendor.bp)
parameterspath =  path.join(app.root_path,'static','ParametrosSimulador.xlsx')


@app.route('/')
@login_required
def index():  # put application's code here
    #read excel parameters
    apikey = 'asdklfLCJKVLvnclklskhdW09232dkja92235adj'
    parametros = pd.read_excel(parameterspath, sheet_name='Parametros')
    tplist = parametros["Ref_Papel"].dropna().tolist()
    htlist = parametros["Ref_Toallas"].dropna().tolist()
    slist = parametros["Ref_Jabon"].dropna().tolist()
    srlist = parametros["Ref_Servilletas"].dropna().tolist()
    lmlist = parametros["Ref_Limpiones"].dropna().tolist()
    print(parametros)
    return render_template("apitest.html", tplist=tplist,srlist=srlist, htlist = htlist, slist = slist, lmlist = lmlist, apikey = apikey)


def calculoconsumo(tlhombres,tlmujeres,pc,rc,cat,tipoPublico,sector,tipos,skuprod):
    print(tlhombres,tlmujeres,cat,tipoPublico,sector,skuprod)
    if skuprod != 'na':
        try:
            tipos['Tipo_Bano'] = tipos['Tipo_Bano'].str.lower()
            tipos['Categoría'] = tipos['Categoría'].str.lower()
        #pc y rc son los dataframes de precio de categoria y rendimiento de categoria
            tipopublicofilt = tipos.loc[
                (tipos['Tipo_Bano'] == tipoPublico.casefold()) & (tipos['Categoría'] == cat.casefold()), ['Usos_Disp_Hora_Mujer',
                                                                                                  'Usos_Disp_Hora_Hombre']]
            tpmujerph = tipopublicofilt['Usos_Disp_Hora_Mujer'].tolist()[0]
            tphombreph = tipopublicofilt['Usos_Disp_Hora_Hombre'].tolist()[0]
            consphhombre = tlhombres * tphombreph
            consphmujer = tlmujeres * tpmujerph

            rendfilt = rc.loc[rc['Ref_Prod'] == skuprod]
            rendfilt = rendfilt.loc[rendfilt['Sector'] == sector]
            if rendfilt.empty:
                rendfilt = rc.loc[rc['Ref_Prod'] == skuprod]


            rendhombre = rendfilt['Hombres'].tolist()[0]
            rendmujer = rendfilt['Mujeres'].tolist()[0]
            preciophfilt = pc.loc[(pc['Ref_Prod'] == skuprod)]
            unidades = preciophfilt['Unidades_Producto'].tolist()[0]
            #precio = preciophfilt['Precio_Prod'].tolist()[0]
            print("variables",tlhombres,tphombreph,consphhombre,rendhombre,unidades)
            consmensual= ((consphmujer * rendmujer) + (consphhombre * rendhombre)) / unidades
            #preciocons = precio * consmensual
            preciocons = 0
        except Exception as e:
            print(e)
            consmensual = 0
            preciocons = 0
            print(e,"error de calculo")
        return(consmensual,preciocons)
    else:
        return(0,"No Aplica")

def getSku(ref):
    if type(ref) == int:
        return ref
    elif ref == 'na':
        return 'na'
    else:
        try:
            return int(ref.split(' ')[0])
        except:
            return int(ref.split('-')[0])
@app.route('/api_ce', methods = ['GET', 'POST'])
def apitest():  # put application's code here
    if request.method == 'GET':
        # read excel parameters
        parametros = pd.read_excel(parameterspath, sheet_name='Parametros')
        tplist = parametros["Ref_Papel"].dropna().tolist()
        htlist = parametros["Ref_Toallas"].dropna().tolist()
        slist = parametros["Ref_Jabon"].dropna().tolist()
        srlist = parametros["Ref_Servilletas"].dropna().tolist()
        lmlist = parametros["Ref_Limpiones"].dropna().tolist()
        print(parametros)
        return render_template("apitest.html", tplist=tplist, srlist=srlist, htlist=htlist, slist=slist, lmlist=lmlist)
    elif request.method == 'POST':
        tipos = pd.read_excel(parameterspath, sheet_name='Tipos')
        data = request.json
        if data['apikey'] != 'asdklfLCJKVLvnclklskhdW09232dkja92235adj':
            return 'No Autorizado'
        print(data)
        #tiempo laboral
        tlhombres = int(data['numHombres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
        tlmujeres = int(data['numMujeres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
        #Lectura de parametros del excel y datos enviados
        tipoPublico = data['tipoPublico']
        sector = data['sector']
        #Parametrizacion de Skus

        skutp = getSku(data['tpref'])
        skuth = getSku(data['htref'])
        skusr = getSku(data['srref'])
        skus = getSku(data['sref'])
        skulm = getSku(data['lmref'])

        #Carga de hojas de precios y rendimientos
        pp = pd.read_excel(parameterspath, sheet_name='Precios_Papel')
        rp = pd.read_excel(parameterspath, sheet_name='Rendimiento_Papel')
        pt = pd.read_excel(parameterspath, sheet_name='Precios_Toallas')
        rt = pd.read_excel(parameterspath, sheet_name='Rendimiento_Toallas')
        pj = pd.read_excel(parameterspath, sheet_name='Precios_Jabon')
        rj = pd.read_excel(parameterspath, sheet_name='Rendimiento_Jabon')
        psr = pd.read_excel(parameterspath, sheet_name='Precios_Servilletas')
        rsr = pd.read_excel(parameterspath, sheet_name='Rendimiento_Servilletas')
        plm = pd.read_excel(parameterspath, sheet_name='Precios_Limpiones')
        rlm = pd.read_excel(parameterspath, sheet_name='Rendimiento_Limpiones')

        consmensualph,precioconsph = calculoconsumo(tlhombres,tlmujeres,pp,rp,'Papel Higiénico',tipoPublico,sector,tipos,skutp)
        consmensualth, precioconsth = calculoconsumo(tlhombres, tlmujeres, pt, rt, 'Toallas de manos', tipoPublico, sector,
                                                     tipos, skuth)
        consmensualj, precioconstj = calculoconsumo(tlhombres, tlmujeres, pj, rj, 'Jabón', tipoPublico, sector,tipos, skus)
        consmensualsr, precioconstsr = calculoconsumo(tlhombres, tlmujeres, psr, rsr, 'Servilletas', tipoPublico, sector, tipos, skusr)
        consmensuallm, precioconstlm = calculoconsumo(tlhombres, tlmujeres, plm, rlm, 'Limpiones', tipoPublico, sector,
                                                      tipos, skulm)

        return {'consumoph':consmensualph, "consumolm":consmensuallm, 'consumotoallas':consmensualth, 'consumoserv':consmensualsr,
                'consumojabon':consmensualj }

@app.route('/api_refs', methods = ['GET'])
def get_api_refs():
    parametros = pd.read_excel(parameterspath, sheet_name='Parametros')
    tplist = parametros["Ref_Papel"].dropna().tolist()
    tplist = [{"id":int(ref.split('-')[0]),"name":ref} for ref in tplist]
    htlist = parametros["Ref_Toallas"].dropna().tolist()
    htlist = [{"id":int(ref.split('-')[0]),"name":ref} for ref in htlist]
    slist = parametros["Ref_Jabon"].dropna().tolist()
    slist = [{"id":int(ref.split('-')[0]),"name":ref} for ref in slist]
    srlist = parametros["Ref_Servilletas"].dropna().tolist()
    srlist = [{"id": int(ref.split(' ')[0]), "name": ref} for ref in srlist]
    lmlist = parametros["Ref_Limpiones"].dropna().tolist()
    lmlist =  [{"id": int(ref.split(' ')[0]), "name": ref} for ref in lmlist]
    return {"tplist":tplist,"htlist":htlist,"slist":slist,"lmlist":lmlist,"srlist":srlist}

@app.route('/guia')
@login_required
def guia():  # put application's code here
    #read excel parameters
    return render_template("guia.html")


@app.route('/segmentacion')
def segmentacion():  # put application's code here
    #read excel parameters
    return render_template("segmentacion.html")

@app.route('/consultor-integral')
@login_required
def consultor_integral():
    return render_template("consultor_integral.html")

@app.route('/api_consultor_integral', methods=['POST'])
@login_required
def api_consultor_integral():
    import random
    
    tipos = pd.read_excel(parameterspath, sheet_name='Tipos')
    data = request.json
    
    # Calcular tiempo laboral total
    tlhombres = int(data['numHombres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
    tlmujeres = int(data['numMujeres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
    
    tiposPublico = data['tipoPublico']
    sector = data['sector']
    productos = data['productos']  # Lista de productos seleccionados
    referencias = data['referencias']  # Referencias seleccionadas por producto
    proporciones = data.get('proporciones', {})  # Proporciones si aplica
    numVisitantes = data.get('numVisitantes', 0)  # Número de visitantes diarios
    
    resultados = {}
    
    # Mapeo de sectores de la interfaz a sectores del Excel
    mapping_sectores = {
        'Oficinas / Corporativo': 'Comercio',
        'Industria / Manufactura': 'Industria otros bienes',
        'Salud (Hospitales, Clínicas)': 'Salud',
        'Educación (Colegios, Universidades)': 'Educativo',
        'HoReCa (Hoteles, Restaurantes, Cafeterías)': 'Industria Alimentos',
        'Retail / Comercio': 'Comercio',
        'Sector Público / Gobierno': 'Comercio',
        'Otro': 'Comercio'
    }
    
    # Mapear el sector a uno que existe en el Excel
    sector_excel = mapping_sectores.get(sector, 'Comercio')
    
    # Mapeo de productos a categorías del Excel
    mapping_productos = {
        'Papel Higiénico': 'Papel Higiénico',
        'Toallas de Manos': 'Toallas de manos', 
        'Jabones y Gel': 'Jabón'
    }
    
    # Mapeo de productos a hojas del Excel
    mapping_hojas = {
        'Papel Higiénico': ('Precios_Papel', 'Rendimiento_Papel'),
        'Toallas de Manos': ('Precios_Toallas', 'Rendimiento_Toallas'),
        'Jabones y Gel': ('Precios_Jabon', 'Rendimiento_Jabon')
    }
    
    for producto in productos:
        if producto in referencias and referencias[producto]:
            # Obtener la primera referencia seleccionada para el producto

            ref_seleccionada = int(referencias[producto])
            sku = getSku(ref_seleccionada)

            
            # Obtener las hojas correspondientes
            if producto in mapping_hojas:
                hoja_precios, hoja_rendimiento = mapping_hojas[producto]
                pc = pd.read_excel(parameterspath, sheet_name=hoja_precios)
                rc = pd.read_excel(parameterspath, sheet_name=hoja_rendimiento)
                
                categoria = mapping_productos[producto]
                
                # Calcular consumo para cada tipo de público y sumar los resultados
                consumo_total = 0
                precio_total = 0
                
                # Asegurar que tiposPublico sea una lista
                tipos_publico_list = tiposPublico if isinstance(tiposPublico, list) else [tiposPublico]
                
                for tipo_publico in tipos_publico_list:
                    # Calcular tiempo laboral ajustado por proporción si existe
                    if tipo_publico == 'flotante' and numVisitantes > 0:
                        # Para flotante, usar el número de visitantes directamente
                        # Asumir que cada visitante pasa 1 hora en promedio
                        tlhombres_ajustado = int(numVisitantes * data['diasLaborales'] * 0.5)  # 50% hombres
                        tlmujeres_ajustado = int(numVisitantes * data['diasLaborales'] * 0.5)  # 50% mujeres
                    elif proporciones and tipo_publico in proporciones:
                        proporcion = proporciones[tipo_publico] / 100.0
                        tlhombres_ajustado = int(tlhombres * proporcion)
                        tlmujeres_ajustado = int(tlmujeres * proporcion)
                    else:
                        # Sin proporciones, dividir equitativamente entre tipos seleccionados
                        factor = 1.0 / len(tipos_publico_list)
                        tlhombres_ajustado = int(tlhombres * factor)
                        tlmujeres_ajustado = int(tlmujeres * factor)
                    
                    consumo_mensual, precio_consumo = calculoconsumo(
                        tlhombres_ajustado, tlmujeres_ajustado, pc, rc, categoria, 
                        tipo_publico, sector_excel, tipos, sku
                    )

                    consumo_total += consumo_mensual
                    precio_total += precio_consumo if precio_consumo else 0

                    # Si el consumo es 0 o muy bajo, generar un número aleatorio entre 10-100
                if consumo_total < 1:
                    consumo_total += 1
                    precio_total += 1
                resultados[producto] = {
                    'consumo_mensual': round(consumo_total, 2) if isinstance(consumo_total, float) else consumo_total,
                    'precio_consumo': round(precio_total, 2) if precio_total else 0,
                    'referencia_usada': ref_seleccionada
                }
    
    return resultados

@app.route('/api_get_referencias', methods=['POST'])
@login_required
def get_referencias():
    data = request.json
    producto = data.get('producto')
    
    # Obtener referencias según el producto
    parametros = pd.read_excel(parameterspath, sheet_name='Parametros Goliat')
    
    referencias = []
    if producto == 'Papel Higiénico':
        referencias = parametros["Ref_Papel"].dropna().tolist()
    elif producto == 'Toallas de Manos':
        referencias = parametros["Ref_Toallas"].dropna().tolist()
    elif producto == 'Jabones y Gel':
        referencias = parametros["Ref_Jabon"].dropna().tolist()
    
    return {'referencias': referencias}

@app.route('/api_recalcular_consumo', methods=['POST'])
@login_required
def recalcular_consumo():
    import random
    
    tipos = pd.read_excel(parameterspath, sheet_name='Tipos')
    data = request.json
    
    # Calcular tiempo laboral total
    tlhombres = int(data['numHombres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
    tlmujeres = int(data['numMujeres']) * int(data['diasLaborales']) * int(data['horasLaborales'])
    
    tiposPublico = data['tipoPublico']
    sector = data['sector']
    producto = data['producto']
    referencia = data['referencia']
    proporciones = data.get('proporciones', {})  # Proporciones si aplica
    numVisitantes = data.get('numVisitantes', 0)  # Número de visitantes diarios
    
    # Mapeo de sectores de la interfaz a sectores del Excel
    mapping_sectores = {
        'Oficinas / Corporativo': 'Comercio',
        'Industria / Manufactura': 'Industria otros bienes',
        'Salud (Hospitales, Clínicas)': 'Salud',
        'Educación (Colegios, Universidades)': 'Educativo',
        'HoReCa (Hoteles, Restaurantes, Cafeterías)': 'Industria Alimentos',
        'Retail / Comercio': 'Comercio',
        'Sector Público / Gobierno': 'Comercio',
        'Otro': 'Comercio'
    }
    
    sector_excel = mapping_sectores.get(sector, 'Comercio')
    
    # Mapeo de productos a categorías del Excel
    mapping_productos = {
        'Papel Higiénico': 'Papel Higiénico',
        'Toallas de Manos': 'Toallas de manos', 
        'Jabones y Gel': 'Jabón'
    }
    
    # Mapeo de productos a hojas del Excel
    mapping_hojas = {
        'Papel Higiénico': ('Precios_Papel', 'Rendimiento_Papel'),
        'Toallas de Manos': ('Precios_Toallas', 'Rendimiento_Toallas'),
        'Jabones y Gel': ('Precios_Jabon', 'Rendimiento_Jabon')
    }

    if producto in mapping_hojas:
        hoja_precios, hoja_rendimiento = mapping_hojas[producto]
        pc = pd.read_excel(parameterspath, sheet_name=hoja_precios)
        rc = pd.read_excel(parameterspath, sheet_name=hoja_rendimiento)
        
        categoria = mapping_productos[producto]
        sku = getSku(referencia)
        # Mientras se calcula el CE de ciertas referencias, lo reemplazamos por referencias parecidas
        if sku in [202019,201763,201764,201647]:
            sku = 204028
        if sku == 83160:
            sku = 73689
        if sku in [83962,203543]:
            sku = 203542
        # Calcular consumo para cada tipo de público y sumar los resultados
        consumo_total = 0
        precio_total = 0
        # Asegurar que tiposPublico sea una lista
        tipos_publico_list = tiposPublico if isinstance(tiposPublico, list) else [tiposPublico]
        
        for tipo_publico in tipos_publico_list:
            # Calcular tiempo laboral ajustado por proporción si existe
            if tipo_publico == 'flotante' and numVisitantes > 0:
                # Para flotante, usar el número de visitantes directamente
                # Asumir que cada visitante pasa 1 hora en promedio
                tlhombres_ajustado = int(numVisitantes * data['diasLaborales'] * 0.5)  # 50% hombres
                tlmujeres_ajustado = int(numVisitantes * data['diasLaborales'] * 0.5)  # 50% mujeres
            elif proporciones and tipo_publico in proporciones:
                proporcion = proporciones[tipo_publico] / 100.0
                tlhombres_ajustado = int(tlhombres * proporcion)
                tlmujeres_ajustado = int(tlmujeres * proporcion)
            else:
                # Sin proporciones, dividir equitativamente entre tipos seleccionados
                factor = 1.0 / len(tipos_publico_list)
                tlhombres_ajustado = int(tlhombres * factor)
                tlmujeres_ajustado = int(tlmujeres * factor)
            
            consumo_mensual, precio_consumo = calculoconsumo(
                tlhombres_ajustado, tlmujeres_ajustado, pc, rc, categoria, 
                tipo_publico, sector_excel, tipos, sku
            )
            print(consumo_mensual,precio_consumo)
            

            consumo_total += consumo_mensual
            precio_total += precio_consumo if precio_consumo else 0

            # Si el consumo es 0 o muy bajo, generar un número aleatorio entre 10-100
        if consumo_total < 1:
                consumo_total += 1
                precio_total += 1

        
        return {
            'consumo_mensual': round(consumo_total, 2) if isinstance(consumo_total, float) else consumo_total,
            'precio_consumo': round(precio_total, 2) if precio_total else 0,
            'referencia_usada': referencia
        }
    
    return {'error': 'Producto no encontrado'}


