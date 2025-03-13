import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    RouterTestingModule,
    HttpClientTestingModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule
  ],
  exports: [
    RouterTestingModule,
    HttpClientTestingModule,
    ToastrModule,
    ReactiveFormsModule
  ]
})
export class TestModule { }
