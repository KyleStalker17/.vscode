import math
square = float(input("What is the side length of the square in centimeters? "))
sarea = square*square
smeters = (square*square)/100
print('The area of the square is',sarea,'centimeters, or',smeters, 'meters.')
rectl = float(input("What is the height of the rectangle in centimeters? "))
rectw = float(input('What is the width of the rectangle in centimeters? '))
rarea = rectl*rectw
rmeters = (rectl*rectw)/100
print('The rectangle has an area of',rarea,'centimeters, or',rmeters,'meters.')
circle = float(input("What is the radius of the circle? "))
carea = ((circle*2)*math.pi)
credu = '{:.5f}'.format(carea)
cmeters = carea/100
cmredu = '{:.5f}'.format(cmeters)
print('The area of the circle is',credu,'or',cmredu,'meters')
main = float(input('Input a length '))
sq_area = main*main
cu_area = main*main*main
ci_area = (2*main)*math.pi
sph_vol = (4/3)*math.pi*(main*main*main)
ci_a_redu = '{:.5f}'.format(ci_area)
sph_redu = '{:.5f}'.format(sph_vol)
print('square area =',sq_area)
print("Cube volume =",cu_area)
print('circle area =',ci_a_redu)
print("Sphere volume =",sph_redu)