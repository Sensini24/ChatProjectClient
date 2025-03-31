import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'initials',
  })
export class InitialsPipe implements PipeTransform {
    transform(palabra: string): string {
        let iniciales = ""; // Declare the variable
        const conversion = palabra.split(" ", palabra.length);
        for (let index = 0; index < conversion.length; index++) {
            const element = conversion[index];
            let letra = element[0];
            iniciales += letra;
        }


        return iniciales;
    }
}