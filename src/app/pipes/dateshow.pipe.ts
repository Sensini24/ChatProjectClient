import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'showDateString'
  })
export class DateShowPipe implements PipeTransform {
    transform(fecha: Date | string): string | undefined {
        console.log("fecha paado: ", fecha, typeof fecha)
        const fechaActual = new Date(fecha);
        const fechaToCompare = new Date();

        if (fechaActual.getDate() === fechaToCompare.getDate() &&
        fechaActual.getMonth() === fechaToCompare.getMonth() &&
        fechaActual.getFullYear() === fechaToCompare.getFullYear()) {
        return "Hoy";
        }

        if (fechaActual.getMonth() === fechaToCompare.getMonth() &&
        fechaActual.getFullYear() === fechaToCompare.getFullYear()) {
        return "Este mes";
        }

        console.log("La fecha no coincide");
        return undefined;
    }
}