import os
import sys
from google import genai
from google.genai import types

# API Anahtarı kontrolü
if not os.environ.get("GEMINI_API_KEY"):
    print("Hata: GEMINI_API_KEY ortam değişkeni bulunamadı!")
    print("Terminalde 'export GEMINI_API_KEY=\"anahtarın\"' komutunu çalıştırdığından emin ol.")
    sys.exit(1)

client = genai.Client()
model_name = 'gemini-2.0-flash'

print("====================================================")
print(f"🤖 Gemini Canlı Terminal Asistanı Başlatıldı ({model_name})")
print("Klasördeki bir dosyayı okutmak için: oku:<dosya_adi.py> mesajınız")
print("Çıkış yapmak için 'exit' yazın.")
print("====================================================\n")

while True:
    try:
        user_input = input("✨ Erkam @ Gemini > ")
        if user_input.strip().lower() == 'exit':
            print("Görüşürüz!")
            break
            
        if not user_input.strip():
            continue

        context = ""
        # Dosya okuma mekanizması (oku:dosya.py şeklinde tetiklenir)
        if user_input.startswith("oku:"):
            try:
                parts = user_input.split(" ", 1)
                file_target = parts[0].replace("oku:", "")
                user_msg = parts[1] if len(parts) > 1 else "Bu kodu incele ve optimize et."
                
                if os.path.exists(file_target):
                    with open(file_target, "r", encoding="utf-8") as f:
                        file_content = f.read()
                    context = f"\n\n[Sistem Notu: Kullanıcı '{file_target}' isimli dosyayı içeriğe ekledi]:\n```\n{file_content}\n```\n"
                    user_input = user_msg
                    print(f"📂 {file_target} başarıyla okundu ve belleğe alındı.")
                else:
                    print(f"❌ Hata: '{file_target}' dosyası bu klasörde bulunamadı!")
                    continue
            except Exception as e:
                print(f"❌ Dosya okunurken hata oluştu: {e}")
                continue

        # İstek gönderiliyor bildirimi
        print("⏳ Gemini düşünüyor ve yanıt üretiyor...")

        # API çağrısı ve detaylı meta veri alımı
        response = client.models.generate_content(
            model=model_name,
            contents=context + user_input,
            config=types.GenerateContentConfig(
                temperature=0.7
            )
        )

        print("\n🤖 Gemini:")
        print(response.text)
        print("\n----------------------------------------------------")
        
        # İşlem detaylarını ve token kullanımını göster
        if response.usage_metadata:
            meta = response.usage_metadata
            print(f"📊 [İşlem Detayları] Girdi Token: {meta.prompt_token_count} | Çıktı Token: {meta.candidates_token_count} | Toplam: {meta.total_token_count}")
        print("====================================================\n")

    except KeyboardInterrupt:
        print("\nÇıkış yapılıyor...")
        break
    except Exception as e:
        print(f"\n❌ Bir hata oluştu: {e}\n")
