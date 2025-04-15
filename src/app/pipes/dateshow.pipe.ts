import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'showDateString'
  })
export class DateShowPipe implements PipeTransform {
    transform(fecha: Date | string): string | undefined {
        // console.log("fecha pasado: ", fecha, typeof fecha)
        const fechaActual = new Date(fecha);
        const fechaToCompare = new Date();

        if (fechaActual.getDay() === fechaToCompare.getDay() &&
            fechaActual.getMonth() === fechaToCompare.getMonth() &&
            fechaActual.getFullYear() === fechaToCompare.getFullYear()) {
            return "Hoy";
        }

        if(fechaActual.getMonth() === fechaToCompare.getMonth() &&
            (fechaToCompare.getDay() - fechaActual.getDay()) <=7 &&
            fechaActual.getFullYear() === fechaToCompare.getFullYear()){
                return "Esta semana";
            }
        

        if (fechaActual.getMonth() === fechaToCompare.getMonth() &&
            fechaActual.getFullYear() === fechaToCompare.getFullYear()) {
            return "Este mes";
        }

        console.log("La fecha no coincide");
        return undefined;
    }
}