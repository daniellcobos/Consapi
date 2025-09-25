from webapp.sqla import sqla


class Portafolio(sqla.Model):
    __tablename__ = 'dt_portafolios'
    
    id = sqla.Column(sqla.BigInteger, primary_key=True, autoincrement=True)
    sector = sqla.Column(sqla.String(50))
    mujeres = sqla.Column(sqla.SmallInteger)
    hombres = sqla.Column(sqla.SmallInteger)
    dias = sqla.Column(sqla.SmallInteger)
    horas = sqla.Column(sqla.SmallInteger)
    tipo = sqla.Column(sqla.String(50))
    refpapel = sqla.Column(sqla.String(80))
    conspapel = sqla.Column(sqla.Numeric)
    refjabones = sqla.Column(sqla.String(80))
    consjabones = sqla.Column(sqla.Numeric)
    reftoallas = sqla.Column(sqla.String(80))
    constoallas = sqla.Column(sqla.Numeric)

    def __repr__(self):
        return f'<Portafolio {self.id}: {self.sector}>'