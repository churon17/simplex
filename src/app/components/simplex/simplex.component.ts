import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

@Component({
    selector: 'app-simplex',
    templateUrl: './simplex.component.html',
    styleUrls: []
})
export class SimplexComponent implements OnInit {

    
    equation: string = 'x^2';
    hideJumbotron : boolean = true;
    options : string[]=  ['Maximizar', 'Minimizar'] ;
    restrictionsFunctions : string[] = [];
    aditionalVariables : string[] = [];
    finallyLargestIndex : number = 0; 
    headerTable : string[] = [];
    restrictionsValues : any[][] = [];
    objectFunction : string = '';
    objectFunctionValue : any ;

    profileForm = new FormGroup({
        objectFunction: new FormControl('z =  2x_1 +4x_2 - 4x_3 +7x_4 '),
        restrictions : new FormArray([
            new FormControl('r1 = 8x_1 - 2x_2 + x_3 - x_4 \\leq 50'),
            new FormControl('r2 = 3x_1 + 5x_2 + 2x_4 \\leq 150'),
            new FormControl('r3 = x_1 - 2x_2 + 2x_3 - 4x_4 \\leq 100 '),
        ]),
        option : new FormControl('Maximizar')
    });

    restrictionsFormArray : FormArray = <FormArray>this.profileForm.controls['restrictions'];

    constructor() { }

    ngOnInit() { }

    addRestriction(){
 
        this.restrictionsFormArray.push(new FormControl(`r${this.restrictionsFormArray.length + 1} = `));
    }

    executeSimplex(){

      
        this.restrictionsFunctions = this.getRestrictionsWithAditionalVariables();

        console.log(this.restrictionsFunctions);

        this.fillHeaderTable(this.finallyLargestIndex);

        this.getRestrictionsValues(this.restrictionsFunctions);

        this.objectFunctionValue = this.getObjectFunctionValue();
  
    }


    getObjectFunctionValue() : any[]{
        
        this.objectFunction = this.profileForm.get('objectFunction').value;

        let objectFunctionValue : any = this.getRestrictionValue(this.objectFunction);

        objectFunctionValue.unshift('z');

        return objectFunctionValue;
    }

    getRestrictionsValues( restrictions : string[]){

        restrictions.forEach((restriction, index) => {

            let restrictionValues : any = this.getRestrictionValue(restriction);

            restrictionValues.unshift(this.aditionalVariables[index]);

            this.restrictionsValues.push(restrictionValues);

        });

    }

    getRestrictionValue(restriction : string) : number[]{

        let splitRestriction =restriction.split('\\leq').join('+').replace(/\s+/g, '');

        let onlyValuesWithIndexes : string[] = [];

        let stringValuesRestriction : string[] = [];

        if(splitRestriction.includes('=')){

            onlyValuesWithIndexes = splitRestriction.split('=')[1].split(/[+]/g); 

        }else{

            onlyValuesWithIndexes = splitRestriction.split(/[+]/g);  

        }   

        for (let init = 0; init < onlyValuesWithIndexes.length; init++) {

            if(onlyValuesWithIndexes[init].includes('-')){

                let valueWithMinus = onlyValuesWithIndexes[init].split('-');

                for (let internalInit = 0; internalInit < valueWithMinus.length; internalInit++) {
                    
                    if(internalInit > 0 ){

                        valueWithMinus[internalInit] = `-${valueWithMinus[internalInit]} `;

                    }

                    stringValuesRestriction.push(valueWithMinus[internalInit]);

                }

            }else{
            
                stringValuesRestriction.push(onlyValuesWithIndexes[init]);
           
            }
            
        }

        return this.pullNumbersFromRestriction(stringValuesRestriction);
        
    }

    pullNumbersFromRestriction( stringValuesRestriction : string[]) : number[]{

        console.log(stringValuesRestriction);

        let restrictionValues : number[] = []; 

        let finallyRestrictionValues : number[] = [];

        stringValuesRestriction.forEach(stringValueRestriction =>{

            if(stringValueRestriction.toLocaleLowerCase().includes('x_')){

                let valuesAndIndexArray = stringValueRestriction.split('x_');
                
                let restrictionValue : number = parseInt(valuesAndIndexArray[0]); 

                let indexValue : number = parseInt(valuesAndIndexArray[1]); 

                if(Number.isNaN(restrictionValue)){
    
                    if(stringValueRestriction.includes('-')){
                        
                        restrictionValue = -1;
    
                    }else{
                        
                        restrictionValue = 1;
                    
                    }
    
                }  
                
                for (let init = 0; init < this.finallyLargestIndex; init++) {
                    
                    if(init === indexValue - 1){

                        restrictionValues[init] = restrictionValue;

                    }else if(restrictionValues[init] === undefined){

                        restrictionValues[init] = 0;

                    }

                }
            
            }else{

                let restrictionValue : number = parseInt(stringValueRestriction);
              
                restrictionValues[this.finallyLargestIndex] = restrictionValue;

            }
        });

        return restrictionValues;
    }


    fillHeaderTable(largestIndexNumber : number){

        this.headerTable[0] = 'start';

        for (let init = 1; init <= largestIndexNumber; init++) {
            this.headerTable.push(`x_${init}`);
        }

        this.headerTable.push('val');

    } 

    addAditionalVariablesToRestrictions(restrictions : string[]) : string[]{

        for (let init = 0; init < restrictions.length; init++) {
          
            restrictions[init] = this.addAditionalVariableToRestriction(restrictions[init], init);
            
        }

        return restrictions;

    }

    addAditionalVariableToRestriction(restriction : string, indexRestriction : number) : string{

        let finalRestriction : string; 
        
        if(restriction.includes('\\leq')){

            let splitRestriction : string[] = restriction.split('\\leq');

            splitRestriction[0] = `${splitRestriction[0]} + ${this.aditionalVariables[indexRestriction]}`; 

            finalRestriction = splitRestriction.join(' \\leq ');

        }else if(restriction.includes('\\geq')){

            let splitRestriction : string[] = restriction.split('\\geq');
            
            splitRestriction[0] = `${splitRestriction[0]} + ${this.aditionalVariables[indexRestriction]}`;

            finalRestriction = splitRestriction.join(' \\geq ');

        }

        return finalRestriction;

    }

    getRestrictionsWithAditionalVariables(){

        this.aditionalVariables = this.getAditionalVariables();
        
        let restrictionsFunctions = this.restrictionsFormArray.value;

        restrictionsFunctions = this.addAditionalVariablesToRestrictions(restrictionsFunctions);

        return restrictionsFunctions;

    }

    getAditionalVariables() : string[]{

        let amountRestrictions = this.restrictionsFormArray.length;
        
        let largestIndex = this.getLargestIndexOnObjectFunction();

        let aditionalVariables : string[] = [];

        for (let init = 1; init <= amountRestrictions; init++) {

            this.finallyLargestIndex = largestIndex + init;
            
            aditionalVariables.push(`x_${this.finallyLargestIndex}`);
        
        }

        return aditionalVariables;

    }

    getLargestIndexOnObjectFunction() : number {

        let valuesObjectFunction = this.getIndexesOnObjectFunction();
        
        let largestIndex = parseInt(valuesObjectFunction[0].slice(-1));
        
        for (let init = 1; init < valuesObjectFunction.length; init++) {
            
            let currentIndex = parseInt(valuesObjectFunction[init].slice(-1));

            if(currentIndex > largestIndex){

                largestIndex = currentIndex;

            }

        }

        return largestIndex;

    }

    getIndexesOnObjectFunction() : string[]{

        let objectFunction : string = this.profileForm.get('objectFunction').value;
        
        objectFunction = objectFunction.replace(/\s+/g, '');
        
        let valuesObjectFunction :string[] = objectFunction.split(/[+-]/g);
        
        return valuesObjectFunction;

    }
}
