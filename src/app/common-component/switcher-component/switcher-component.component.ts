

import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-switcher-component',
  standalone: true,
  imports: [],
  templateUrl: './switcher-component.component.html',
  styleUrls: ['./switcher-component.component.css']
})
export class SwitcherComponentComponent  implements OnInit {

  constructor(
      private cookie: CookieService) { }




  ngOnInit() {
    const dataColor = this.cookie.get('theme-color');
    if (dataColor)
      document.documentElement.style.setProperty("--main-color", dataColor);
    else
      document.documentElement.style.setProperty("--main-color", '#a2719e');



    


    // Use type assertion to specify the expected type of the selected element
    const switcherBtn = document.querySelector(".switcher-btn") as HTMLElement | null;
    const colorSwitcher = document.querySelector(".color-switcher") as HTMLElement | null;
    const themeButtons = document.querySelectorAll<HTMLElement>(".theme-buttons");

    if (switcherBtn && colorSwitcher) {
      // Add click event listener to switcher button
      switcherBtn.onclick = () => {
        colorSwitcher.classList.toggle("active");
      };
    }

    themeButtons.forEach((color) => {
      color.addEventListener("click", () => {
        const dataColor = color.getAttribute("data-color");
        if (dataColor) {
          this.cookie.set("theme-color", dataColor);
          document.documentElement.style.setProperty("--main-color", dataColor);

        }
      });
    });


  }


}





