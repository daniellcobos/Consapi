import pandas as pd

df = pd.read_excel('C:/Users/danie/OneDrive/Documentos/GitHub/Consapi/webapp/static/Portfolio_copy.xlsx')

print("Raw Excel columns:", df.columns.tolist())
print("\nFirst few rows:")
print(df.head())

# Check for Papel Higiénico + Higiene Crítica combinations
papel_higiene = df[
    (df.iloc[:,1].astype(str).str.contains('Papel')) &
    (df.iloc[:,0].astype(str).str.contains('Higiene'))
]

print("\nPapel Higiénico + Higiene Crítica combinations:")
for i, row in papel_higiene.iterrows():
    print(f"Row {i}: {row.iloc[2]} -> {row.iloc[3]}")

print(f"\nTotal combinations found: {len(papel_higiene)}")

# Check if Tráfico Pico exists
trafico_pico = df[df.iloc[:,2].astype(str).str.contains('Pico')]
print(f"\nTráfico Pico rows found: {len(trafico_pico)}")

if len(trafico_pico) > 0:
    print("Tráfico Pico examples:")
    for i, row in trafico_pico.head(3).iterrows():
        print(f"Row {i}: {row.iloc[1]} - {row.iloc[0]} - {row.iloc[2]}")