import { Component, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';

import { CustomValidators } from './custom-validators';

@Component({
  selector: 'dumper',
  outputs: ['ngSubmittedJsonGraphInstance'],
  templateUrl: './dumper.component.html',
  styleUrls: ['./dumper.component.css']
})
export class DumperComponent {
  private ngSubmittedJsonGraphInstance:EventEmitter<Object>;
  private form:FormGroup;
  private json:AbstractControl;
  @ViewChild('jsonInput') jsonInput;

  constructor(formBuilder: FormBuilder) {
    this.ngSubmittedJsonGraphInstance = new EventEmitter();
    this.form = formBuilder.group({
      'json': ['', Validators.compose([Validators.required, CustomValidators.isValidJson, CustomValidators.isJsonGraphInstance])]
    })
    this.json = this.form.controls['json'];
  }

  sendData(data:Object):void {
    this.cleanInput(data);
    if(this.form.valid) {
      this.ngSubmittedJsonGraphInstance.emit(JSON.parse(data['json']));
    }
  }

  private cleanInput(data:Object):void {
    this.jsonInput.nativeElement.value = JSON.stringify(JSON.parse(data['json']), null, "\t");
    this.jsonInput.nativeElement.scrollTop = 0;
  }
}
