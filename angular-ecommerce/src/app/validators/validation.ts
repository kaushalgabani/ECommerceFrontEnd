import { FormControl, ValidationErrors } from "@angular/forms";

export class Validation {

    //whitespace validation 
    static notOnlyWhiteSpace(control: FormControl) : ValidationErrors{

        //check if string only contains whitespace
        if((control.valid != null) && (control.value.trim().length === 0)){
            //invalid, return error object
            return{'notOnlyWhiteSpace': true}
        }else{
            return {};
        }
    }
}
