#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
શાસ્ત્રીજી જીતેન્દ્ર જોષી (જીતુભાઈ જોષી) - પૂજા સામગ્રી & પેમ્ફ્લેટ OCR સર્વિસ
Powered by PaddleOCR (ONNX Runtime CPU Engine in Python VENV)
સ્કેન કરેલ તસવીરમાંથી ગુજરાતી ટેક્સ્ટ ઓળખી આપમેળે એડમિન ફોર્મ ભરે છે.
"""

import os
import sys
import re
import json
import base64
import argparse
from io import BytesIO
from typing import Dict, Any, List

# Reconfigure stdio to UTF-8 on Windows
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Suppress PaddleX verbose warning logs
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["PYTHONIOENCODING"] = "utf-8"

# Third-party imports from venv
from PIL import Image, ImageEnhance
from paddleocr import PaddleOCR

# Flask imports for HTTP backend mode
try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False


# =====================================================================
# ૧. શાસ્ત્રીજી પૂજા નિયમ & ડિક્શનરી (Smart Gujarati Rule-Based Parser)
# =====================================================================

ANAJ_KEYWORDS = [
    'ઘઉં', 'ચોખા', 'તલ', 'કાળાતલ', 'કાળા તલ', 'મગ', 'દાળ', 'ચણાદાળ', 'તુવેર', 'અડદ',
    'વટાણા', 'મઠ', 'કઠોળ', 'પ્રસાદ', 'નૈવેદ્ય', 'સુખડી', 'શિરો', 'શીરો', 'લાડુ',
    'ખીર', 'સીધુ', 'પંચામૃત', 'ફળ', 'ફળો', 'દૂધ', 'દહીં', 'ઘી', 'મધ', 'સાકર', 'ખાંડ', 'પેંડા'
]

TAIYARI_KEYWORDS = [
    'બાજોઠ', 'પાટલો', 'થાળી', 'વાટકા', 'ચમચી', 'દીવો', 'અખંડ દીપ', 'અગરબત્તી સ્ટેન્ડ',
    'તાંબાનો લોટો', 'તાંબુ', 'તાંબું', 'પિત્તળ', 'ગ્લાસ', 'ડબ્બો', 'કપ', 'રકાબી', 'આસન',
    'બાકસ', 'આરતી', 'ફાનસ', 'છત્રી', 'લાકડી', 'ગાદલું', 'ગોદડુ', 'ઓછાડ', 'ઓશીકુ',
    'વસ્ત્ર', 'ચપ્પલ', 'શણગાર', 'મૂર્તિ', 'સૂર્ય', 'ધર્મરાજ', 'સાથિયો', 'જનોઈ',
    'નીસરણી', 'ગાય', 'હોડી', 'તુલસીક્યારો', 'સોનાની ચૂક', 'મોતી', 'પલંગ', 'કળશ'
]

PUJAPO_KEYWORDS = [
    'શ્રીફળ', 'સોપારી', 'અબીલ', 'ગુલાલ', 'કંકુ', 'ચંદન', 'સિંદુર', 'સિંદૂર',
    'તજ', 'લવિંગ', 'એલચી', 'ગોળ', 'દ્રાક્ષ', 'કાજુ', 'બદામ', 'પીસ', 'લાલ પીસ',
    'સફેદ પીસ', 'લીલુ પીસ', 'પીળું પીસ', 'નાડાછડી', 'દડી', 'કપૂર', 'સુતળી',
    'કેળના પાન', 'આસોપાલવ', 'તોરણ', 'તુલસીપત્ર', 'તુલસી', 'પડીયા', 'નાગરવેલ',
    'હાર', 'ફૂલહાર', 'ફૂલ', 'યજ્ઞોપવીત', 'જાવંત્રી', 'જાયફળ', 'અગરબત્તી', 'ધૂપ'
]

CATEGORY_RULES = {
    'કર્મકાંડ': ['હવન', 'પિતૃ', 'શ્રાદ્ધ', 'નારાયણ બલી', 'શાંતિ', 'નવગ્રહ', 'યજ્ઞ', 'કર્મકાંડ', 'દશા', 'વિધિ'],
    'ધાર્મિક પૂજા': ['ગણેશ', 'શિવ', 'રુદ્રાભિષેક', 'લક્ષ્મી', 'દુર્ગા', 'હનુમાન', 'કૃષ્ણ', 'રામ', 'સરસ્વતી', 'વિષ્ણુ', 'પૂજા'],
    'વ્રત અને ઉદ્યાપન': ['સત્યનારાયણ', 'વ્રત', 'ઉદ્યાપન', 'એકાદશી', 'સૂર્યદેવ', 'કથા', 'વ્રત કથા'],
    'સામાજિક વિધિ': ['ગૃહપ્રવેશ', 'વાસ્તુ', 'વિવાહ', 'લગ્ન', 'સીમંત', 'નામકરણ', 'જનોઈ વિધિ']
}


def clean_text_line(text: str) -> str:
    """સફેદ સ્પેસ અને નકામા અક્ષરો દૂર કરે છે."""
    if not text:
        return ""
    text = re.sub(r'[•●▪■◆★*]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def parse_pooja_text(raw_text: str, line_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    PaddleOCR દ્વારા પ્રાપ્ત થયેલ લખાણમાંથી સ્માર્ટ પારસિંગ:
    - પૂજાનું શીર્ષક (Title)
    - કેટેગરી (Category)
    - દક્ષિણા (Dakshina / Price)
    - પૂજાપો (Pujapo)
    - અનાજ અને નૈવેદ્ય (Anaj)
    - વાસણ અને સાહિત્ય (Bartan)
    - ઘરની તૈયારી (Preparation)
    """
    lines = [clean_text_line(l.get('text', '')) for l in line_items if l.get('text')]
    if not lines and raw_text:
        lines = [clean_text_line(l) for l in raw_text.split('\n') if clean_text_line(l)]

    parsed = {
        'title': '',
        'category': 'ધાર્મિક પૂજા',
        'price': 'દક્ષિણા માટે સંપર્ક કરો',
        'badge': 'ધાર્મિક વિધિ',
        'pujapo': '',
        'anajNaivedya': '',
        'taiyari': '',
        'notes': ''
    }

    if not lines:
        return parsed

    # ૧. પૂજાના નામની ઓળખ (Detect Title)
    # પહેલી ૩-૪ લાઈનોમાં પૂજા/કથા/યજ્ઞ/સ્થાપન સંબંધિત શીર્ષક શોધો
    for line in lines[:4]:
        for kw in ['સત્યનારાયણ', 'ગણેશ', 'ગૃહપ્રવેશ', 'વાસ્તુ', 'હવન', 'લગ્ન', 'વિવાહ', 'રુદ્ર', 'શિવ', 'લક્ષ્મી', 'કથા', 'પૂજા', 'વિધિ']:
            if kw in line and len(line) < 60:
                # ક્લીન અપ કરો
                clean_title = re.sub(r'^(શ્રી\s*)?', 'શ્રી ', line).strip()
                if not clean_title.startswith('શ્રી'):
                    clean_title = 'શ્રી ' + clean_title
                parsed['title'] = clean_title
                break
        if parsed['title']:
            break

    if not parsed['title'] and lines:
        # ફોલબેક: પહેલી લાઈન જો માન્ય લંબાઈ ધરાવતી હોય
        first_line = lines[0]
        if len(first_line) < 40 and not any(k in first_line for k in ['ફોન', 'મોબાઈલ', 'સંપર્ક']):
            parsed['title'] = first_line

    # ૨. કેટેગરી નિર્ધારણ (Category Classification)
    full_blob = ' '.join(lines)
    for cat_name, kw_list in CATEGORY_RULES.items():
        if any(kw in full_blob or (parsed['title'] and kw in parsed['title']) for kw in kw_list):
            parsed['category'] = cat_name
            break

    # ૩. દક્ષિણા / કિંમત નિર્ધારણ (Dakshina / Price Detection)
    price_match = re.search(r'(?:દક્ષિણા|રૂ\.|રૂપિયા|Rs\.?|INR|\₹)\s*[:=\-]?\s*([0-9૦-૯]{3,6})', full_blob)
    if price_match:
        parsed['price'] = f"₹ {price_match.group(1)}/-"
    else:
        # સામાન્ય દક્ષિણા રકમ (e.g. 1100, 2100, 5100)
        num_match = re.search(r'\b(1100|1500|2100|2500|3100|5100|11000)\b', full_blob)
        if num_match:
            parsed['price'] = f"₹ {num_match.group(1)}/-"

    # ૪. સામગ્રી વિભાજન (Pujapo, Anaj, Bartan, Taiyari categorization)
    pujapo_items = []
    anaj_items = []
    taiyari_items = []

    # દરેક લાઈનને અલ્પવિરામ અથવા સ્પેસથી છૂટી પાડો
    all_tokens = []
    for line in lines:
        parts = re.split(r'[,،;|\n]+', line)
        for part in parts:
            part = part.strip()
            if part and len(part) > 1 and not re.match(r'^[0-9૦-૯\-\.:]+$', part):
                all_tokens.append(part)

    for item in all_tokens:
        lower_item = item.lower()
        matched = False

        # Check Anaj & Naivedya
        for kw in ANAJ_KEYWORDS:
            if kw in lower_item:
                anaj_items.append(item)
                matched = True
                break

        if matched:
            continue

        # Check Bartan & Taiyari
        for kw in TAIYARI_KEYWORDS:
            if kw in lower_item:
                taiyari_items.append(item)
                matched = True
                break

        if matched:
            continue

        # Check Pujapo
        for kw in PUJAPO_KEYWORDS:
            if kw in lower_item:
                pujapo_items.append(item)
                matched = True
                break

        if not matched and len(item) > 2:
            # જો શીર્ષક કે ફોન નંબર ન હોય તો સામાન્ય પૂજાપોમાં ઉમેરો
            if not any(k in item for k in ['ફોન', 'સંપર્ક', '99252', 'જોષી', 'શાસ્ત્રી']):
                pujapo_items.append(item)

    # ડીડુપ્લિકેશન અને ફોર્મેટિંગ
    def dedupe_and_format(items):
        seen = set()
        res = []
        for x in items:
            c = x.strip()
            if c and c not in seen:
                seen.add(c)
                res.append(c)
        return ', '.join(res)

    parsed['pujapo'] = dedupe_and_format(pujapo_items)
    parsed['anajNaivedya'] = dedupe_and_format(anaj_items)
    parsed['taiyari'] = dedupe_and_format(taiyari_items)

    # બેજ લેબલ
    if parsed['category'] == 'કર્મકાંડ':
        parsed['badge'] = 'શાસ્ત્રોક્ત વિધિ'
    elif parsed['category'] == 'વ્રત અને ઉદ્યાપન':
        parsed['badge'] = 'મહત્વપૂર્ણ વ્રત'
    elif parsed['category'] == 'સામાજિક વિધિ':
        parsed['badge'] = 'મંગલ પ્રસંગ'
    else:
        parsed['badge'] = 'પવિત્ર પૂજન'

    return parsed


# =====================================================================
# ૨. PaddleOCR એન્જિન મેનેજર (Singleton with ONNX Runtime CPU)
# =====================================================================

class PaddleOCREngine:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            print("🚀 PaddleOCR એન્જિન લોડ થઈ રહ્યું છે (ONNX Runtime CPU)...", file=sys.stderr)
            cls._instance = PaddleOCR(
                engine='onnxruntime',
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False
            )
            print("✅ PaddleOCR એન્જિન સફળતાપૂર્વક શરૂ થયું!", file=sys.stderr)
        return cls._instance


def preprocess_image(img_input):
    """ઈમેજ કોન્ટ્રાસ્ટ અને ક્લેરિટી વધારે છે."""
    if isinstance(img_input, str):
        img = Image.open(img_input)
    elif isinstance(img_input, bytes):
        img = Image.open(BytesIO(img_input))
    else:
        img = img_input

    # Convert to RGB
    img = img.convert('RGB')

    # Resize if too large
    max_dim = 2000
    w, h = img.size
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        img = img.resize((int(w * ratio), int(h * ratio)), Image.Resampling.LANCZOS)

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.25)
    return img


def run_ocr(image_source) -> Dict[str, Any]:
    """
    PaddleOCR ચલાવી ટેક્સ્ટ અને પારસિંગ પરિણામ રિટર્ન કરે છે.
    """
    engine = PaddleOCREngine.get_instance()

    # Preprocess
    temp_path = "temp_ocr_input.jpg"
    processed = preprocess_image(image_source)
    processed.save(temp_path, "JPEG", quality=95)

    try:
        results = engine.predict(temp_path)
        extracted_lines = []
        raw_text_parts = []

        for r in results:
            texts = r.get('rec_texts', [])
            scores = r.get('rec_scores', [])

            for idx, text in enumerate(texts):
                t_clean = text.strip()
                if not t_clean:
                    continue
                score = float(scores[idx]) if idx < len(scores) else 1.0
                extracted_lines.append({
                    'text': t_clean,
                    'confidence': round(score, 3)
                })
                raw_text_parts.append(t_clean)

        raw_text = "\n".join(raw_text_parts)
        parsed = parse_pooja_text(raw_text, extracted_lines)

        return {
            'success': True,
            'raw_text': raw_text,
            'lines': extracted_lines,
            'parsed': parsed,
            'engine': 'PaddleOCR (ONNX Runtime CPU in Python VENV)'
        }
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# =====================================================================
# ૩. ફ્લાસ્ક HTTP સર્વર (Backend REST API)
# =====================================================================

def create_app():
    if not FLASK_AVAILABLE:
        raise RuntimeError("Flask ઇન્સ્ટોલ નથી.")

    app = Flask(__name__)
    CORS(app)

    @app.route('/health', methods=['GET', 'HEAD'])
    def health():
        return jsonify({
            'status': 'ok',
            'service': 'shastriji-paddleocr',
            'engine': 'PaddleOCR with ONNX Runtime CPU'
        })

    @app.route('/api/ocr/scan', methods=['POST'])
    def scan_api():
        try:
            # ૧. ચેક ફાઈલ અપલોડ
            if 'file' in request.files:
                file_obj = request.files['file']
                file_bytes = file_obj.read()
                result = run_ocr(file_bytes)
                return jsonify(result)

            # ૨. ચેક Base64 JSON
            data = request.get_json(silent=True) or {}
            img_b64 = data.get('image') or data.get('dataUrl') or data.get('image_base64')
            if img_b64:
                # Remove header if data url
                if ',' in img_b64:
                    img_b64 = img_b64.split(',', 1)[1]
                file_bytes = base64.b64decode(img_b64)
                result = run_ocr(file_bytes)
                return jsonify(result)

            return jsonify({
                'success': False,
                'error': 'તસવીર ફાઈલ અથવા Base64 ડેટા મોકલવામાં આવ્યો નથી.'
            }), 400

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    return app


# =====================================================================
# ૪. CLI & સર્વર એન્ટ્રી પોઇન્ટ
# =====================================================================

def main():
    parser = argparse.ArgumentParser(description="PaddleOCR Backend for Shastriji Pooja Samagri CMS")
    parser.add_argument('--serve', action='store_true', help="Start HTTP Flask API server")
    parser.add_argument('--port', type=int, default=5001, help="Server port (default: 5001)")
    parser.add_argument('--file', type=str, help="Process single image file in CLI mode")
    args = parser.parse_args()

    if args.serve:
        app = create_app()
        port = args.port
        print(f"🚀 શાસ્ત્રીજી PaddleOCR સર્વિસ લાઈવ છે: http://127.0.0.1:{port}", file=sys.stderr)
        app.run(host='0.0.0.0', port=port, debug=False)
    elif args.file:
        if not os.path.exists(args.file):
            print(json.dumps({'success': False, 'error': f'ફાઈલ મળી નથી: {args.file}'}, ensure_ascii=False))
            sys.exit(1)
        res = run_ocr(args.file)
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
