import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-filter-section',
  imports: [CommonModule],
  templateUrl: './filter-section.component.html',
  styleUrl: './filter-section.component.css'
})
export class FilterSectionComponent {
  @Input() filterOptions: any;

  ngOnInit() {
    console.log('Filter options received in child component:', this.filterOptions);
  }

  ngOnChanges() {
    //console.log('Filter options updated:', this.filterOptions);
  }
}
