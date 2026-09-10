include <threads.scad>

difference() {
    union(){
        for(a = [0:20:360]){
            rotate(a) {
                translate([55,0,0]){
                    cylinder(30,2.5,2.5,false);
                }
            }
        }
        difference(){
            difference() {
                cylinder(30, 55, 55, false);
                
                translate([0,0,5]){
                    metric_thread (diameter=102, pitch=8, length=30);
                }

            }

            difference() {
                translate([0, 0, +70])
                sphere(r=65);
                translate([0, 0, +90])
                cube(120, true);
            }
        }
    }

    translate([0, 0, 90]) difference() {
        difference() {
                translate([0, 0, -70])
                sphere(r=65);
                translate([0, 0, -20])
                cube(130, true);
        }
        translate([0, 0, -60]) sphere(r=60);
    }
}