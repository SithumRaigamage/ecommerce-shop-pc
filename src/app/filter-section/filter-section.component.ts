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
  filterKeys: string[] = [];

  ngOnInit() {
    console.log('Filter options:', this.filterOptions);
    if (this.filterOptions) {
      // Exclude priceRange since it's not a list
      this.filterKeys = Object.keys(this.filterOptions).filter(key => key !== 'priceRange');
    }
  }

  ngOnChanges() {
    //console.log('Filter options updated:', this.filterOptions);
  }
}
