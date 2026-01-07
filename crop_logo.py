from PIL import Image
import sys
import os

def crop_logo():
    input_path = '/Users/daxpatel/Desktop/vibecodeing/Gardgear/public/gearguard-logo.png'
    output_path = '/Users/daxpatel/Desktop/vibecodeing/Gardgear/public/gearguard-logo.png'
    
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        
        # 1. Get the bounding box of the content (remove empty transparent space)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        width, height = img.size
        print(f"Content dimension: {width}x{height}")
        
        # 2. Crop to isolate the icon (The shield)
        # Based on the user request, we want to remove the "GearGuard" text.
        # In the visual seen earlier, the text is at the bottom of the content.
        # We will crop the bottom ~35% of the content which typically contains the text.
        
        new_height = int(height * 0.65)  # Keep top 65%
        
        # Center crop horizontally to match the new height (making it roughly square)
        # Assuming the shield is centered
        
        icon_width = new_height # Make it square based on height
        
        left = (width - icon_width) // 2
        right = left + icon_width
        
        crop_box = (
            left,
            0,
            right,
            new_height
        )
        
        # Ensure bounds
        crop_box = (
            max(0, crop_box[0]),
            0,
            min(width, crop_box[2]),
            new_height
        )
        
        icon = img.crop(crop_box)
        
        # One last trim to remove any extra transparent space around the icon itself
        final_bbox = icon.getbbox()
        if final_bbox:
            icon = icon.crop(final_bbox)
        
        icon.save(output_path)
        print(f"Successfully cropped logo to {icon.size}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    crop_logo()
