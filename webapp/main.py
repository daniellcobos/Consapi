from flask import Flask,render_template,request
from os import path
import pandas as pd

app = Flask(__name__)

parameterspath =  path.join(app.root_path,'static','ParametrosSimulador.xlsx')

@app.route('/')
def index():  # put application's code here
    #read excel parameters
    parametros = pd.read_excel(parameterspath, sheet_name='Parametros')
    tplist = parametros["Ref_Papel"].dropna().tolist()
    htlist = parametros["Ref_Toallas"].dropna().tolist()
    slist = parametros["Ref_Jabon"].dropna().tolist()
    srlist = parametros["Ref_Servilletas"].dropna().tolist()
    lmlist = parametros["Ref_Limpiones"].dropna().tolist()
    print(parametros)
    return render_template("apitest.html", tplist=tplist,srlist=srlist, htlist = htlist, slist = slist, lmlist = lmlist)


def calculoconsumo(tlhombres,tlmujeres,pc,rc,cat,tipoPublico,sector,tipos,skuprod):
    if skuprod != 'na':
        try:
        #pc y rc son los dataframes de precio de categoria y rendimiento de categoria
            tipopublicofilt = tipos.loc[
                (tipos['Tipo_Bano'] == tipoPublico) & (tipos['Categoría'] == cat), ['Usos_Disp_Hora_Mujer',
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
            print(e)
        return(consmensual,preciocons)
    else:
        return("No Aplica","No Aplica")

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