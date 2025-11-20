#!/usr/bin/env python3
"""
Skrypt do generowania obrazu przedstawiającego model Audi na tle dywaników 3D.
Pobiera zdjęcie modelu Audi z internetu, łączy z obrazem dywaników i dodaje opis.
"""

import requests
from PIL import Image, ImageDraw, ImageFont
import io
import sys
import os
from pathlib import Path

# Informacje o modelu Audi A4 B9
MODEL_INFO = {
    "brand": "Audi",
    "model": "A4",
    "generation": "B9",
    "years": "2015-2023",
    "body_type": "Sedan",
    "description": "Audi A4 B9 to elegancka limuzyna klasy średniej, produkowana w latach 2015-2023. Model ten charakteryzuje się nowoczesnym designem, zaawansowaną technologią oraz doskonałymi osiągami. Idealnie pasujące dywaniki 3D zapewniają maksymalną ochronę wnętrza pojazdu."
}

def download_car_image(url=None):
    """
    Pobiera zdjęcie samochodu z internetu.
    Jeśli URL nie jest podany, używa przykładowego URL.
    """
    if url is None:
        # Przykładowy URL do zdjęcia Audi A4 B9 (można zmienić)
        url = "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
    
    try:
        print(f"📥 Pobieranie zdjęcia z: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        img = Image.open(io.BytesIO(response.content))
        print(f"✅ Pobrano zdjęcie: {img.size[0]}x{img.size[1]}px")
        return img
    except Exception as e:
        print(f"⚠️ Błąd przy pobieraniu zdjęcia: {e}")
        print("🔄 Tworzenie przykładowego obrazu...")
        # Tworzenie przykładowego obrazu jeśli pobieranie się nie powiodło
        img = Image.new('RGB', (800, 500), color='#1a1a1a')
        draw = ImageDraw.Draw(img)
        draw.text((400, 250), "Audi A4 B9", fill='white', anchor='mm')
        return img

def create_mats_image(width=1200, height=800):
    """
    Tworzy obraz dywaników 3D na podstawie opisu użytkownika.
    """
    # Tworzenie białego tła z czarną ramką
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Czarne ramki
    border_width = 20
    draw.rectangle([0, 0, width-1, height-1], outline='black', width=border_width)
    
    # Tekst "3D" na górze
    try:
        # Próba użycia większej czcionki
        font_size = 120
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text_bbox = draw.textbbox((0, 0), "3D", font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_x = (width - text_width) // 2
    text_y = 50
    draw.text((text_x, text_y), "3D", fill='black', font=font)
    
    # Rysowanie dywaników (uproszczona wersja)
    mats_y = height // 2 + 50
    
    # Lewy dywanik (większy, nieregularny kształt)
    left_mat_points = [
        (200, mats_y - 100),
        (250, mats_y - 150),
        (350, mats_y - 160),
        (400, mats_y - 120),
        (450, mats_y - 100),
        (500, mats_y - 80),
        (480, mats_y + 100),
        (450, mats_y + 120),
        (400, mats_y + 150),
        (350, mats_y + 140),
        (300, mats_y + 120),
        (250, mats_y + 100),
        (220, mats_y + 50),
        (200, mats_y)
    ]
    
    # Prawy dywanik (mniejszy, prostszy kształt)
    right_mat_points = [
        (650, mats_y - 80),
        (700, mats_y - 90),
        (750, mats_y - 85),
        (800, mats_y - 70),
        (820, mats_y - 50),
        (810, mats_y + 80),
        (780, mats_y + 100),
        (730, mats_y + 110),
        (680, mats_y + 100),
        (650, mats_y + 80)
    ]
    
    # Rysowanie dywaników z czerwoną obwódką
    mat_color = (60, 60, 60)  # Ciemny szary
    edge_color = (255, 0, 0)  # Czerwony
    
    # Lewy dywanik
    draw.polygon(left_mat_points, fill=mat_color)
    draw.polygon(left_mat_points, outline=edge_color, width=5)
    
    # Prawy dywanik
    draw.polygon(right_mat_points, fill=mat_color)
    draw.polygon(right_mat_points, outline=edge_color, width=5)
    
    return img

def combine_images(car_image, mats_image, output_path):
    """
    Łączy zdjęcie samochodu z obrazem dywaników i dodaje opis.
    """
    # Przygotowanie rozmiarów
    mats_width, mats_height = mats_image.size
    car_width, car_height = car_image.size
    
    # Skalowanie zdjęcia samochodu do odpowiedniego rozmiaru
    target_car_width = mats_width
    target_car_height = int(car_height * (target_car_width / car_width))
    car_image_resized = car_image.resize((target_car_width, target_car_height), Image.Resampling.LANCZOS)
    
    # Wysokość tekstu opisu
    description_height = 200
    
    # Tworzenie finalnego obrazu
    final_width = mats_width
    final_height = mats_height + target_car_height + description_height
    
    final_image = Image.new('RGB', (final_width, final_height), color='white')
    
    # Umieszczenie zdjęcia samochodu na górze
    final_image.paste(car_image_resized, (0, 0))
    
    # Umieszczenie obrazu dywaników pod zdjęciem
    final_image.paste(mats_image, (0, target_car_height))
    
    # Dodanie opisu modelu
    draw = ImageDraw.Draw(final_image)
    
    try:
        title_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 48)
        desc_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
    
    y_offset = target_car_height + mats_height + 20
    
    # Tytuł
    title = f"{MODEL_INFO['brand']} {MODEL_INFO['model']} {MODEL_INFO['generation']}"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (final_width - title_width) // 2
    draw.text((title_x, y_offset), title, fill='black', font=title_font)
    
    # Podtytuł
    y_offset += 60
    subtitle = f"{MODEL_INFO['body_type']} • {MODEL_INFO['years']}"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=desc_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (final_width - subtitle_width) // 2
    draw.text((subtitle_x, y_offset), subtitle, fill='gray', font=desc_font)
    
    # Opis (wieloliniowy)
    y_offset += 50
    description = MODEL_INFO['description']
    # Podział tekstu na linie
    words = description.split()
    lines = []
    current_line = []
    max_width = final_width - 100
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=desc_font)
        if bbox[2] - bbox[0] <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    
    for line in lines:
        line_bbox = draw.textbbox((0, 0), line, font=desc_font)
        line_width = line_bbox[2] - line_bbox[0]
        line_x = (final_width - line_width) // 2
        draw.text((line_x, y_offset), line, fill='black', font=desc_font)
        y_offset += 35
    
    # Zapisanie obrazu
    final_image.save(output_path, 'PNG', quality=95)
    print(f"✅ Obraz zapisany: {output_path}")
    print(f"📐 Rozmiar: {final_width}x{final_height}px")

def main():
    """
    Główna funkcja skryptu.
    """
    print("🚗 Generator obrazu modelu Audi z dywanikami 3D")
    print("=" * 60)
    
    # Sprawdzenie argumentów
    mats_image_path = None
    if len(sys.argv) > 1:
        mats_image_path = sys.argv[1]
        if not os.path.exists(mats_image_path):
            print(f"⚠️ Plik {mats_image_path} nie istnieje. Tworzenie obrazu dywaników...")
            mats_image_path = None
    
    # Pobranie lub utworzenie obrazu dywaników
    if mats_image_path:
        print(f"📂 Ładowanie obrazu dywaników z: {mats_image_path}")
        mats_image = Image.open(mats_image_path)
    else:
        print("🎨 Tworzenie obrazu dywaników 3D...")
        mats_image = create_mats_image()
    
    # Pobranie zdjęcia samochodu
    car_image_url = sys.argv[2] if len(sys.argv) > 2 else None
    car_image = download_car_image(car_image_url)
    
    # Utworzenie finalnego obrazu
    output_path = "output/audi-a4-b9-with-mats.png"
    os.makedirs("output", exist_ok=True)
    
    combine_images(car_image, mats_image, output_path)
    
    print("\n✨ Gotowe!")
    print(f"📁 Obraz zapisany w: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    main()








