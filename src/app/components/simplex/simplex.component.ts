import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { isObject } from 'util';

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
    pivoteColumn : number = 0;
    pivoteRow : number = 0;
    currentPivote : number = 0;
    objectFunctionHelper = [];


    allResults : number[][][] = [];
    allPresentResults : string[][][] = [];

    profileForm = new FormGroup({
        objectFunction: new FormControl('z =  2x_1 +4x_2 - 4x_3 +7x_4 '),
        restrictions : new FormArray([
            new FormControl('r1 = 8x_1 - 2x_2 + x_3 - x_4 \\leq 50'),
            new FormControl('r2 = 3x_1 + 5x_2 + 2x_4 \\leq 150'),
            new FormControl('r3 = x_1 - x_2 + 2x_3 - 4x_4 \\leq 100 '),
        ]),
        option : new FormControl('Maximizar')
    });

    // profileForm = new FormGroup({
    //     objectFunction: new FormControl('z =  -2x_1 + 3x_2'),
    //     restrictions : new FormArray([
    //         new FormControl('r1 = 2x_1 - x_2 \\leq 10'),
    //         new FormControl('r2 = -x_1 - 5x_2  \\leq 20'),
    //         new FormControl('r3 = 6x_1 - 12x_2 \\leq 18  '),
    //     ]),
    //     option : new FormControl('Maximizar')
    // });

    restrictionsFormArray : FormArray = <FormArray>this.profileForm.controls['restrictions'];

    constructor() { }

    ngOnInit() { }

    addRestriction(){
 
        this.restrictionsFormArray.push(new FormControl(`r${this.restrictionsFormArray.length + 1} = `));
    }

    executeSimplex(){

        this.objectFunction = this.profileForm.get('objectFunction').value;

        let option : boolean = this.profileForm.controls['option'].value.toUpperCase() === 'MAXIMIZAR' ? true : false;

        this.restrictionsFunctions = this.getRestrictionsWithAditionalVariables();

        this.fillHeaderTable(this.finallyLargestIndex);

        this.getRestrictionsValues(this.restrictionsFunctions);
        
        this.objectFunctionValue = this.getObjectFunctionValue();
        
        if(option){
            this.maximizeObjectFunction();
        }

        this.equalToZeroObjectFunction();

        let valuesIterations = [...this.restrictionsValues]
        
        let mainFunction = this.objectFunctionValue;
        
        let iteration = 0;

        while(!this.isValid(mainFunction)){

            this.currentPivote = this.getPivote(valuesIterations, mainFunction);

            let resultIteration =  this.getAnotherIteration(valuesIterations, mainFunction);

            this.allResults[iteration] =  resultIteration.newValuesIteration;
            this.allPresentResults[iteration] = resultIteration.newShowValuesIteration;
            
            mainFunction = [...resultIteration.newValuesIteration[resultIteration.newValuesIteration.length - 1]];

            for (let index = 0; index < resultIteration.newValuesIteration.length -1; index++) {
                
                valuesIterations[index] = resultIteration.newValuesIteration[index];
                
            }
            
            iteration++;
        }   

        return;

    }

    getAnotherIteration(valuesIteration, objectFunction){
      
        let newValuesIteration : number[][] = [];
        
        let newShowValuesIteration : any[][] = [];

        let currentRow = [];

        let currentShowRow = [];

        for (let init = 0; init < valuesIteration[this.pivoteRow].length; init++) {
            
            if(init === 0){

                currentRow.push(this.headerTable[this.pivoteColumn]);
                currentShowRow.push(this.headerTable[this.pivoteColumn]);

            }else{
                
                let value = valuesIteration[this.pivoteRow][init] / this.currentPivote;

                currentRow.push(value);
                
                if(Number.isInteger(value)){
                
                    currentShowRow.push(value);
                
                }else{

                    currentShowRow.push(this.decimalToFraction(Math.round(value * 100)/100).display);
                }

            }
        }

        newValuesIteration[this.pivoteRow] = currentRow;
        newShowValuesIteration[this.pivoteRow] = currentShowRow;

        for (let firstInit = 0; firstInit < valuesIteration.length + 1; firstInit++) {
            
            if(this.pivoteRow !== firstInit){

                let newRow : any = [];

                if(firstInit === valuesIteration.length){

                    newRow = this.convertToZeroDifferentPivote(objectFunction, currentRow);

                }else{

                    newRow = this.convertToZeroDifferentPivote(valuesIteration[firstInit], currentRow);
                
                }

                newValuesIteration[firstInit] = newRow.currentRow;
                newShowValuesIteration[firstInit] = newRow.currentShowRow;
            }
        }

        return {
            newValuesIteration,
            newShowValuesIteration
        };
    }

    convertToZeroDifferentPivote(differentRow : any, pivoteRow : any){

        let currentRow = [];
        let currentShowRow = [];

        let value = differentRow[this.pivoteColumn];

        if(value === 0){

            currentRow = differentRow;

            differentRow.forEach((element, indice) => {
                
                if(indice === 0){

                    currentShowRow.push(element);

                }else{  
                    
                    if(Number.isInteger(element)){

                        currentShowRow.push(element);
    
                    }else{

                        currentShowRow.push(this.decimalToFraction(Math.round(element * 100)/100).display);

                    }

                }

            });

            let valuesReturn = {
                currentRow,
                currentShowRow
    
            }
    
            return valuesReturn;
        }

        let helperValue =  value * -1;

      
        for (let init = 0; init < differentRow.length; init++) {
            
            if(init === 0){

                currentRow.push(differentRow[init]);
                currentShowRow.push(differentRow[init]);

            }else{
                
                let pivoteValue = (pivoteRow[init] * helperValue);

                let differentValue = differentRow[init]

                let currentValue = pivoteValue + differentValue;

                currentRow.push(currentValue);

                if(Number.isInteger(currentValue)){

                    currentShowRow.push(currentValue);

                }else{
                    currentShowRow.push(this.decimalToFraction(Math.round(currentValue * 100)/100).display);
                }
            }

        }

        let valuesReturn = {
            currentRow,
            currentShowRow

        }

        return valuesReturn;
       
    }

    isValid(mainFunction) : boolean{

        for (let init = 1; init < mainFunction.length; init++) {
            
              if(mainFunction[init] < 0){
                  return false;
              }  
        }

        return true;        

    }

    getPivote(restrictionsValues, objectFunction){

        this.pivoteColumn = this.getLessIndexOnObjectFunction(objectFunction);

        let candidateValues = [];

        let candidateRows = [];

        let tamanio = restrictionsValues[0].length - 1;

        for (let init = 0; init < restrictionsValues.length; init++) {
            
            let dividend = restrictionsValues[init][tamanio];
            
            let divisor =  restrictionsValues[init][this.pivoteColumn];

            if(divisor > 0){

                let result = dividend/divisor;
                
                candidateValues.push(result);

                candidateRows.push(init);
            }
        }
        this.pivoteRow = this.getRowColumn(candidateValues, candidateRows, restrictionsValues);

        return restrictionsValues[this.pivoteRow][this.pivoteColumn];
        
    }

    getRowColumn(candidateValues : number[], candidateIndexes  : number[], restrictionValues){

        let lessValue = candidateValues[0];
        let lessIndex = 0;

        if(candidateValues.length < 2){
            
            return candidateIndexes[lessIndex];
        }

        for (let init = 1; init < candidateValues.length; init++) {
            
            let currentValue = candidateValues[init];

            if(currentValue < lessValue){

                lessValue = currentValue;

                lessIndex = init;

            }else if(currentValue === lessValue){

                let lessIndexValue = restrictionValues[candidateIndexes[lessIndex]][this.pivoteColumn];

                let currentIndexValue = restrictionValues[candidateIndexes[init]][this.pivoteColumn];

                if(currentIndexValue < lessIndexValue){

                    lessValue = candidateValues[init];

                    lessIndex = init;
                
                }else{

                    lessValue = candidateValues[lessIndex];
                }
            }
        }

        return candidateIndexes[lessIndex];
    }

    getLessIndexOnObjectFunction(objectFunction){

        let lessValue = parseInt(objectFunction[1]);

        let indexValue = 1;
        
        for (let init = 2; init < objectFunction.length; init++) {

            let currentValue = parseInt(objectFunction[init]);
          
            if( lessValue > currentValue ){

                lessValue = currentValue;

                indexValue = init;
            }
        }

        return indexValue;
    }

    maximizeObjectFunction(){

        for (let init = 0; init < this.objectFunctionValue.length; init++) {

            let currentValue = parseInt(this.objectFunctionValue[init]);

            if( !Number.isNaN(currentValue) && currentValue !== 0 ){

                this.objectFunctionValue[init] = currentValue * -1;

            }
            
        }

    }
    

    equalToZeroObjectFunction(){
        
        let defaultNumber : number = 0;

        this.objectFunctionHelper.forEach((element : string) =>{

            if(!element.includes('x')){
                defaultNumber = parseInt(element);
            }

        });

        if(defaultNumber === 0){

            this.objectFunctionValue.push(defaultNumber);

        }
    }

    getObjectFunctionValue() : any[]{
        
        let objectFunctionValue : any = this.getRestrictionValue(this.objectFunction, true);

        objectFunctionValue.unshift('z');

        return objectFunctionValue;
    
    }

    getRestrictionsValues( restrictions : string[], isFunctionObject ? : boolean){

        restrictions.forEach((restriction, index) => {

            let restrictionValues : any = this.getRestrictionValue(restriction);

            restrictionValues.unshift(this.aditionalVariables[index]);

            this.restrictionsValues.push(restrictionValues);

        });

    }

    getRestrictionValue(restriction : string, isFunctionObject ? : boolean) : number[]{
        // let option = '';

        // if(restriction.includes('\\leq')){

        //     option = '\\leq';

        // }else if(restriction.includes('\\geq')){

        //     option = '\\geq';
        // }

        
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

        stringValuesRestriction = stringValuesRestriction.filter( value => {
            return value !== ""; 
        });

        if(isFunctionObject){
            
            this.objectFunctionHelper = stringValuesRestriction;

        }

        return this.pullNumbersFromRestriction(stringValuesRestriction);
        
    }

    pullNumbersFromRestriction( stringValuesRestriction : string[]) : number[]{

        let restrictionValues : number[] = []; 

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

        let largestIndex = 0;

        if(valuesObjectFunction[0].length > 2){
            largestIndex = parseInt(valuesObjectFunction[0].slice(-1));
        }else{
            largestIndex = parseInt(valuesObjectFunction[1].slice(-1));
        }
        
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

    gcd(a, b) {
        return (b) ? this.gcd(b, a % b) : a;
    }

    decimalToFraction(_decimal) {
        if (_decimal == parseInt(_decimal)) {
            return {
                top: parseInt(_decimal),
                bottom: 1,
                display: parseInt(_decimal) + '/' + 1
            };
        }
        else {
            var top = _decimal.toString().includes(".") ? _decimal.toString().replace(/\d+[.]/, '') : 0;
            var bottom = Math.pow(10, top.toString().replace('-','').length);
            if (_decimal >= 1) {
                top = +top + (Math.floor(_decimal) * bottom);
            }
            else if (_decimal <= -1) {
                top = +top + (Math.ceil(_decimal) * bottom);
            }
    
            var x = Math.abs(this.gcd(top, bottom));
            return {
                top: (top / x),
                bottom: (bottom / x),
                display: (top / x) + '/' + (bottom / x)
            };
        }
    };
}
