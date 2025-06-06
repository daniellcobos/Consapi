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
        return int(ref.split(' ')[0])

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
    tplist = [{"id":int(ref.split(' ')[0]),"name":ref} for ref in tplist]
    htlist = parametros["Ref_Toallas"].dropna().tolist()
    htlist = [{"id":int(ref.split(' ')[0]),"name":ref} for ref in htlist]
    slist = parametros["Ref_Jabon"].dropna().tolist()
    slist = [{"id":int(ref.split(' ')[0]),"name":ref} for ref in slist]
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


