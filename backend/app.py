from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import os
import requests
import re
import threading

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False 
CORS(app)

COMMENTS_FILE = 'comments.txt'

# --- 1. 資源資料 (保留原始連結) ---
resources = {
    "數學": [
        { "title": "楊翰數學", "link": "https://www.youtube.com/@%E6%A5%8A%E7%BF%B0%E6%95%B8%E5%AD%B8" },
        { "title": "臺北酷課雲-學測數學", "link": "https://www.youtube.com/playlist?list=PLm778hWdXOZlnxUMW4awU3SbQL1G_3Ny_" },
        { "title": "陳義數學", "link": "https://www.youtube.com/@%E9%99%B3%E7%BE%A9%E6%95%B8%E5%AD%B8/courses" },
        { "title": "顏琇婷高中數學", "link": "https://www.youtube.com/@YenHsiuTing" },
        { "title": "瑀瑀數學 x Yu Yu Math", "link": "https://www.youtube.com/@is_yuyu_math/search?query=%E9%AB%98%E4%B8%AD%E6%95%B8%E5%AD%B8" },
        { "title": "凌海燕（小樂學堂）-數學", "link": "https://www.youtube.com/playlist?list=PLR1ACzwrLF_09MidJqluugHTHQCErNeSb" },
        { "title": "阿毛高中數學教室", "link": "https://www.youtube.com/@Amoumath/playlists" },
        { "title": "周杰數學", "link": "https://www.youtube.com/@%E5%91%A8%E6%9D%B0%E6%95%B8%E5%AD%B8-%E6%9C%80%E5%A5%BD%E5%90%B8%E6%94%B6%E7%9A%84/playlists" },
        { "title": "教高中數學的建名老師", "link": "https://www.youtube.com/@cmmath/playlists" },
        { "title": "數學老師張旭", "link": "https://www.youtube.com/@changhsumath/search?query=%E9%AB%98%E4%B8%AD%E6%95%B8%E5%AD%B8" },
        { "title": "高中數學-其他網站資源1", "link": "https://vocus.cc/article/63949617fd897800019c4e50" }
    ],
    "化學": [
        { "title": "昌哥高中化學(108課綱)教學影片", "link": "https://www.youtube.com/@%E6%98%8C%E5%93%A5%E9%AB%98%E4%B8%AD%E5%8C%96%E5%AD%B8118%E8%AA%B2%E7%B6%B1%E6%95%99/playlists" },
        { "title": "臺北酷課雲-化學", "link": "https://www.youtube.com/@CooC-Cloud/search?query=%E9%AB%98%E4%B8%AD%E5%8C%96%E5%AD%B8" },
        { "title": "HHSH ShrimpScience", "link": "https://www.youtube.com/@JHSNUShrimpScience/playlists" },
        { "title": "Astro Ni 倪赫擎-化學", "link": "https://www.youtube.com/@astroni8803/search?query=%E5%8C%96%E5%AD%B8" },
        { "title": "東方王", "link": "https://www.youtube.com/@imeasternking/playlists" },
        { "title": "威克漢化學 Wickhan Chemistry", "link": "https://www.youtube.com/@wickhanchemistry/playlists" },
        { "title": "凌海燕（小樂學堂）-化學", "link": "https://www.youtube.com/playlist?list=PLR1ACzwrLF_3JEmrFtjdGYHIUtnWtiPCK" },
        { "title": "高中化學-其他網站資源1", "link": "https://tw.amazingtalker.com/blog/zh-tw/k12/29381/" },
        { "title": "高中化學-其他網站資源2", "link": "https://www.ltedu.com.tw/web/resources.aspx?KIND=1&SUBJECT_ID=13&SOURCE_ID1=25&ALLFILE=1" }
    ],
    "物理": [
        { "title": "吳旭明x蔡佳玲-物理學習網", "link": "https://www.youtube.com/@phywu" },
        { "title": "臺北酷課雲", "link": "https://www.youtube.com/@CooC-Cloud/search?query=%E9%AB%98%E4%B8%AD%E7%89%A9%E7%90%86" },
        { "title": "Astro Ni 倪赫擎-高一必修物理", "link": "https://www.youtube.com/playlist?list=PL9tm-yco7y4ARhf-G3ut2Lhe41V9iJhFX" },
        { "title": "Astro Ni 倪赫擎-選修物理", "link": "https://www.youtube.com/@astroni8803/search?query=%E9%81%B8%E4%BF%AE%E7%89%A9%E7%90%86" },
        { "title": "群浩物理-高一必修物理", "link": "https://www.youtube.com/playlist?list=PLNUkOVmrz3XfyZhO6of-9pYKn4gGMGOgu" },
        { "title": "群浩物理-選修物理", "link": "https://www.youtube.com/playlist?list=PLNUkOVmrz3XdUKSFZN5TQJcvud_7OiZ69" },
        { "title": "龍騰高中聲", "link": "https://www.youtube.com/@LTeduForStudent/search?query=%E9%AB%98%E4%B8%AD%E7%89%A9%E7%90%86" },
        { "title": "凌海燕（小樂學堂）-物理", "link": "https://www.youtube.com/playlist?list=PLR1ACzwrLF_1W1nOT0-0WI51VsufIWO3C" },
        { "title": "丞翊物語_PHY‘s show-學測物理 ", "link": "https://www.youtube.com/playlist?list=PLLg-MHEWhWjsEUbwdEaJ9hJTT_oHt5pz1" },
        { "title": "高中物理-其他網站資源1", "link": "https://sites.google.com/site/phyelearning/home?authuser=0" },
        { "title": "高中物理-其他網站資源2", "link": "https://tw.amazingtalker.com/blog/zh-tw/k12/28890/" },
        { "title": "高中物理-其他網站資源3", "link": "https://chendaneyl.blogspot.com/2013/12/blog-post_2.html" }
    ]
}

# --- 2. 爬蟲快取機制 ---
subs_cache = {}
def fetch_youtube_subs(url):
    if "youtube.com" not in url: return "網站資源"
    # 如果是影片清單連結，爬蟲抓不到訂閱數，直接回傳這個
    if "playlist" in url: return "點擊頻道查看"
    
    try:
        # 模擬更真實的瀏覽器，以免被當成機器人
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"
        }
        r = requests.get(url, headers=headers, timeout=5)
        r.encoding = 'utf-8'

        # 嘗試第一種抓法：標準標籤
        match = re.search(r'"subscriberCountText":\{"simpleText":"(.*?)"\}', r.text)
        if match:
            return match.group(1).replace("位訂閱者", "").strip()

        # 嘗試第二種抓法：針對行動版或新版介面
        match2 = re.search(r'aria-label="[^"]*?([\d\.]+[萬|k|M]?)\s*位訂閱者"', r.text)
        if match2:
            return match2.group(1)

        # 嘗試第三種抓法：暴力掃描
        match3 = re.search(r'([\d\.]+[萬|k|M]?)\s*位訂閱者', r.text)
        if match3:
            return match3.group(1)

        return "點擊查看"
    except Exception as e:
        print(f"爬取錯誤: {e}")
        return "連結失效"

def update_subs_worker():
    for cat in resources:
        for item in resources[cat]:
            subs_cache[item['link']] = fetch_youtube_subs(item['link'])

# 啟動時更新一次
threading.Thread(target=update_subs_worker).start()


@app.route('/api/resources', methods=['GET'])
def get_resources():
    output = {}
    for cat, items in resources.items():
        output[cat] = []
        for item in items:
            new_item = item.copy()
            new_item['subs'] = subs_cache.get(item['link'], "更新中...")
            output[cat].append(new_item)
    return Response(json.dumps(output, ensure_ascii=False), mimetype='application/json')



@app.route('/api/comments', methods=['GET', 'POST'])
def handle_comments():
    if request.method == 'POST':
        data = request.json
        if data and data.get('comment'):
            with open(COMMENTS_FILE, 'a', encoding='utf-8') as f:
                f.write(data.get('comment') + '\n')
            return jsonify({"status": "success"}), 201
        return jsonify({"status": "failed"}), 400
    
    if not os.path.exists(COMMENTS_FILE): return jsonify([])
    with open(COMMENTS_FILE, 'r', encoding='utf-8') as f:
        comments = [line.strip() for line in f.readlines()]
    return Response(json.dumps(comments, ensure_ascii=False), mimetype='application/json')

if __name__ == '__main__':
    # 修改這裡：上架時 Render 會指定 PORT，沒指定時預設 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port) # 允許外部連線