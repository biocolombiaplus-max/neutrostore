import colombia from 'colombia-territorial';

// Departamentos y municipios (ciudades) de Colombia para el formulario de
// envío, con los datos oficiales del DANE.
const DEPARTAMENTOS = colombia.departamentos.map((d) => d.nombre).sort((a, b) => a.localeCompare(b, 'es'));

export function getProvinces(): string[] {
  return DEPARTAMENTOS;
}

// La capital del departamento va primero (es la opción más elegida); el
// resto en orden alfabético.
export function getCantons(departamento: string): string[] {
  if (!departamento) return [];
  const capital = colombia.getCapital(departamento);
  const names = colombia
    .getMunicipios(departamento)
    .map((m) => m.nombre)
    .sort((a, b) => a.localeCompare(b, 'es'));
  if (!capital || !names.includes(capital)) return names;
  return [capital, ...names.filter((n) => n !== capital)];
}
