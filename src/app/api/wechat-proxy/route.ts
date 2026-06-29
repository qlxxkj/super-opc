// api/WeChatProxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { action, body } = await req.json();

  const APP_ID = process.env.WX_APP_ID || '';
  const APP_SECRET = process.env.WX_APP_SECRET || '';

  try {
    // 获取 access_token
    if (action === 'getToken') {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APP_ID}&secret=${APP_SECRET}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.errcode) {
        return NextResponse.json({ error: data.errmsg }, { status: 400 });
      }
      return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in });
    }

    // 上传临时素材（封面图）
    if (action === 'uploadTempMedia') {
      const token = body.access_token;
      const form = new FormData();
      form.append('media', body.file, body.filename);
      form.append('type', 'image');

      const res = await fetch(
        `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`,
        { method: 'POST', body: form }
      );
      const data = await res.json();
      if (data.errcode) {
        return NextResponse.json({ error: data.errmsg }, { status: 400 });
      }
      return NextResponse.json({ media_id: data.media_id });
    }

    // 创建草稿
    if (action === 'createDraft') {
      const token = body.access_token;
      const res = await fetch(
        `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articles: body.articles }),
        }
      );
      const data = await res.json();
      if (data.errcode) {
        return NextResponse.json({ error: data.errmsg }, { status: 400 });
      }
      return NextResponse.json({ media_id: data.media_id });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
