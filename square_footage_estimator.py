import cv2
import numpy as np

def estimate_area_from_image(image_path, known_width_inches=120):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7,7), 0)
    edged = cv2.Canny(blurred, 50, 100)

    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest = max(contours, key=cv2.contourArea)
    x,y,w,h = cv2.boundingRect(largest)

    pixels_per_inch = w / known_width_inches
    area_sq_inches = (w / pixels_per_inch) * (h / pixels_per_inch)
    area_sq_ft = area_sq_inches / 144
    return round(area_sq_ft, 2)