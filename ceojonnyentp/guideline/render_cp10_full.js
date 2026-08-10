const fs = require('fs');
const src = '/Users/nakta/nakta/볼트/RE_FEEEL_Vault/40_프로젝트/브랜드가이드라인/조니_AD솔루션/CP10_장문텍스트정본_보고서형_v3_260809.md';
const MARK = process.argv.includes('--mark');   // 표시 전용 사본 생성 플래그
const dest = '/Users/nakta/nakta/도구/brand_guide/ceojonnyentp/guideline/'+(MARK?'cp10_mark.html':'cp10_full_report.html');
const lines = fs.readFileSync(src,'utf8').split(/\r?\n/);
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// v3(260809) 동기화. 존재 검증은 이 파일 하단 verifyMarks()에서 수행한다.
const marks=[
  '이미 형성된 조니의 성격과 영향력 가운데 무엇이 AD솔루션의 자격으로 이동하고 무엇이 조니 개인에게 머무는지 구분한 뒤 필요한 의미 전이를 의도적으로 설계하는 것',
  '내 상황을 이해하는가, 이 문제를 구분할 능력이 있는가, 자기 이익보다 내 상태를 먼저 볼 것인가',
  '도달의 회계와 브랜드 의미의 회계를 분리해야 합니다.',
  '매번 연결하지 않되, 연결될 이유가 생긴 순간에는 분명하게 연결합니다.',
  '그래서 AD솔루션은 제품의 효능을 설명하기 전에 선택의 조건을 설명해야 합니다.',
  '대상을 자른다 → 통념을 반문한다 → 말할 자격을 붙인다 → 이유를 분류한다 → 행동을 절단형으로 끝낸다',
  '누구에게 말하는지, 조니가 왜 이 말을 할 수 있는지, 어떤 상태를 구분하는지, 제품이 그 판단에서 어떤 역할을 하는지',
  '인물에게 붙은 속성과 제품이 해결하는 문제 사이에 인과와 적합성',
  '제품을 지우면 이야기의 갈등과 해결이 달라지는가',
  '고객 상담, DM, CS, 무물, 본인 피부의 경과, 제품을 쓰는 순간, 제조와 개발에서 내린 선택',
  '사람은 조니를 보러 옵니다. 그 사람이 자기 피부를 판단할 기준을 얻는 순간, AD솔루션이 남습니다.'
];
// 강조 단일화 (낙타 확정 260810): 주황 형광펜(marks) 하나만 쓴다. 파랑 밑줄(underlines)은 폐지 — 되살리지 말 것.
// ── 절·부 상호 참조 앵커 사전. MD를 미리 훑어 실재하는 절 번호만 링크한다(없는 번호는 평문 유지).
// refTitles: 같은 훑기에서 앵커별 '번호 + 실제 제목'을 모은다 — 상호 참조 툴팁 문구의 유일한 출처(지어내지 않는다).
const refTitles=new Map();
const refTargets=(()=>{
 const set=new Set();
 const clean=s=>s.replace(/\*\*/g,'').replace(/`/g,'').trim();
 lines.forEach(l=>{
  let m=l.match(/^##\s+((?:[A-Za-z]|\d+)-\d+)\.\s*(.*)$/);
  if(m){const id='s-'+m[1].toLowerCase();set.add(id);
   refTitles.set(id,(/^[A-Za-z]/.test(m[1])?'부록 ':'')+m[1]+'. '+clean(m[2]))}
  m=l.match(/^#\s+(\d+)부\.\s*(.*)$/); if(m){set.add('part-'+m[1]);refTitles.set('part-'+m[1],m[1]+'부. '+clean(m[2]))}
  m=l.match(/^#\s+부록\s*([AB])\.\s*(.*)$/); if(m){const id='appendix-'+m[1].toLowerCase();set.add(id);
   refTitles.set(id,'부록 '+m[1]+'. '+clean(m[2]))}
  else{m=l.match(/^#\s+부록\s*([AB])\b/); if(m)set.add('appendix-'+m[1].toLowerCase())}
 });
 return set;
})();
let tipCount=0,tipMiss=[];
let xrefCount=0,igCount=0,brandCount=0,inHeading=false;
// 브랜드·계정 표기 → 계정 링크. 긴 이름부터 매칭하고 절마다 첫 등장 1회만 건다.
const BRANDS=[['Tower 28 Beauty','tower28beauty'],['Tower 28','tower28beauty'],['Dieux Skin','dieuxskin'],['Dieux','dieuxskin'],
 ['Dr. Shereene Idriss','shereeneidriss'],['Dr. Idriss','dridriss'],['The Futur','thechrisdo'],['Chris Do','thechrisdo'],
 ['톤즈의원','dr_ohmi'],['톤즈','dr_ohmi']];
let seenBrand=new Set();
// ── 부록 라우팅: 부록 A·B는 본편이 아니라 부록 페이지로 빌드된다(MD 정본은 하나) ──
const APPENDIX_PAGE='cp10_appendix_read.html',MAIN_PAGE='cp10_full_report.html';
const extAttrRef=' target="_blank" rel="noopener"';   // 문서를 건너뛰는 참조는 언제나 새 탭
const isAppendixAnchor=id=>/^(appendix-[ab]|s-[ab]-\d)/.test(id);
const inAppendix=()=>part>=15;
// 본문 산문의 인스타그램 핸들 멘션 — 실제 핸들 목록 기반 매칭(문장부호가 핸들에 딸려 들어가지 않게 목록으로 고정)
const IGHANDLES=['yezi.beauty','shellness.kr','solhee.choi','jessijeanhome','tower28beauty','charlotteparler','shereeneidriss','thechrisdo','tonesbrand_kr','dieuxskin','dridriss','dr_ohmi'].sort((a,b)=>b.length-a.length);
// 이동 안내 툴팁 — '→ 번호. 실제 제목' (문서를 건너뛰면 '(새 탭)'을 덧붙인다). 제목은 refTitles 에서만 가져온다.
const gotoAttr=(id,cross)=>{const t=refTitles.get(id);
 if(!t){tipMiss.push(id);return ''}
 tipCount++;return ` data-goto="${esc('→ '+t+(cross?' (새 탭)':''))}"`};
const xrefA=(id,txt)=>{xrefCount++;
 const ap=isAppendixAnchor(id),here=inAppendix();
 if(ap===here)return `<a class="xref" href="#${id}"${gotoAttr(id,false)}>${txt}</a>`;   // 같은 문서 안
 const page=ap?APPENDIX_PAGE:MAIN_PAGE;                                        // 문서를 건너뛰는 참조
 return `<a class="xref xref-ext" href="${page}#${id}"${gotoAttr(id,true)} target="_blank" rel="noopener">${txt}</a>`};
function xref(t){
 // 절 번호 — 10-5 / 9-2. 날짜(2026-01-18)·수치 범위와 겹치지 않도록 앞뒤 경계를 좁게 잡는다.
 t=t.replace(/(^|[^0-9A-Za-z\-·])((?:1[0-3]|[1-9])-\d)(?![0-9\-])/g,(m,pre,ref)=>
   refTargets.has('s-'+ref)?pre+xrefA('s-'+ref,ref):m);
 // 부록 절 — A-0 / B-1
 t=t.replace(/(^|[^0-9A-Za-z\-])([AB]-\d)(?![0-9\-])/g,(m,pre,ref)=>
   refTargets.has('s-'+ref.toLowerCase())?pre+xrefA('s-'+ref.toLowerCase(),ref):m);
 // 부록 A / 부록 B
 t=t.replace(/부록\s([AB])(?![-A-Za-z0-9])/g,(m,ap)=>
   refTargets.has('appendix-'+ap.toLowerCase())?xrefA('appendix-'+ap.toLowerCase(),m):m);
 // 브랜드명 첫 등장 (절 단위) — 제목 줄에는 걸지 않는다(제목의 @핸들이 이미 링크)
 if(!inHeading)for(const [name,hd] of BRANDS){
  if(seenBrand.has(hd))continue;
  const i=t.indexOf(name);
  if(i<0)continue;
  // 한글 조사(…는/…의)는 붙어도 같은 표기로 본다. 라틴 문자·숫자로 이어질 때만 부분 일치로 보고 건너뛴다.
  if(/[A-Za-z0-9]/.test(t[i+name.length]||'')||/[A-Za-z0-9]/.test(t[i-1]||''))continue;
  seenBrand.add(hd);brandCount++;
  t=t.slice(0,i)+`<a class="xref brand-link" href="https://www.instagram.com/${hd}/" target="_blank" rel="noopener">${name}</a>`+t.slice(i+name.length);
 }
 // @핸들 멘션
 for(const hd of IGHANDLES){
  t=t.replace(new RegExp('@'+hd.replace(/[.]/g,'\\.')+'(?![A-Za-z0-9._])','g'),m=>{
   igCount++;return `<a class="xref ig-mention" href="https://www.instagram.com/${hd}/" target="_blank" rel="noopener">${m}</a>`});
 }
 // N부
 t=t.replace(/(^|[^0-9])((?:1[0-3]|[1-9])부)(?![A-Za-z0-9])/g,(m,pre,ref)=>{
   const id='part-'+ref.replace('부','');
   return refTargets.has(id)?pre+xrefA(id,ref):m});
 return t;
}
// 태그·기존 링크·code 안쪽은 건드리지 않는다(중첩 앵커·href 훼손 방지)
const linkRefs=h=>h.split(/(<a\b[^>]*>[\s\S]*?<\/a>|<code>[\s\S]*?<\/code>|<[^>]+>)/).map((seg,i)=>i%2?seg:xref(seg)).join('');
// 도해 우측 주석 스택. 캡션 → 해설 → 포인터 순으로 <!--ASIDE--> 자리에 쌓인다.
// 우측 트랙 텍스트는 문장마다 블록으로 나눈다(좁은 폭에서 한 덩어리로 늘어지는 것 방지).
// 경계는 '다.' + 공백만 인정하고, 따옴표·괄호 안이거나 태그 균형이 깨지면 분할하지 않는다.
function sentBlocks(html){
 if(!html)return '';
 const parts=[];let buf='',par=0,q=0,tag=false;
 for(let i=0;i<html.length;i++){
  const ch=html[i];
  if(ch==='<')tag=true;
  buf+=ch;
  if(ch==='>'){tag=false;continue}
  if(tag)continue;
  if(ch==='('||ch==='（')par++;
  else if(ch===')'||ch==='）')par=Math.max(0,par-1);
  else if(ch==='“'||ch==='‘'||ch==='＂')q++;
  else if(ch==='”'||ch==='’')q=Math.max(0,q-1);
  if(ch==='.'&&/다\.$/.test(buf)&&par===0&&q===0){
   const nxt=html[i+1];
   if(nxt===undefined||/\s/.test(nxt)){parts.push(buf.trim());buf=''}
  }
 }
 if(buf.trim())parts.push(buf.trim());
 const balanced=parts.every(t=>((t.match(/<(?!\/)[a-zA-Z][^>]*>/g)||[]).filter(x=>!/\/>$/.test(x)).length)===((t.match(/<\/[a-zA-Z]+>/g)||[]).length));
 if(parts.length<2||!balanced)return `<p>${html}</p>`;
 return parts.map(t=>`<p>${t}</p>`).join('');
}
const aside=(cap,extra)=>`<div class="visual-aside">${cap?`<div class="v-cap">${sentBlocks(cap)}</div>`:''}${extra||''}<!--ASIDE--></div>`;
const asideAdd=(h,frag)=>h.replace('<!--ASIDE-->',frag+'<!--ASIDE-->');
const isVisualBlock=h=>/^<(figure|div) class="(visual|rewrite|swap|bookmark-grid)[ "]/.test(h);
// 해설 이동 대상은 도해·표(figure.visual)만. 임베드·갤러리(div.visual)는 AE 지그재그·본문 유지.
const isFigureBlock=h=>/^<figure class="visual[ "]/.test(h);
// 본문 폭(--prose)이 기본. 데이터 밀도가 높아 라벨이 깨지는 도해만 예외로 --wide 유지.
const WIDEFIG=new Set(['4-1','5-1','9-1']);
const movedAside=[],bmMissing=[],strayPtr=[];let labelBullets=0;
const LNK=String.fromCharCode(1);
// noref=true — 도해·표·개작 블록 내부 라벨. 상호 참조 링크를 넣지 않는다.
function inline(s,noref){
  let x=esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  // 마크다운 링크 [텍스트](url) — 자동 링크보다 먼저 뽑아 토큰으로 보관한다(주소가 다시 링크되면 깨진다)
  const held=[];
  // 부록 페이지로 건너뛰는 링크는 앵커가 붙어도 새 탭 — 읽던 자리를 잃지 않게(양방향 동일 규칙)
  x=x.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,t,h)=>{const ext=/^https?:/.test(h)||h.startsWith(APPENDIX_PAGE);
   if(h===APPENDIX_PAGE){
    held.push(`<a class="link-chip" href="${h}" target="_blank" rel="noopener">${t}</a>`);
    return LNK+(held.length-1)+LNK;
   }
   held.push(`<a class="doc-a" href="${h}"${ext?' target="_blank" rel="noopener"':''}>${t}</a>`);return LNK+(held.length-1)+LNK});
  x=x.replace(/(https:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
  for(const m of marks){const e=esc(m);x=x.replace(e,`<span class="marker">${e}</span>`)}
  if(!noref)x=linkRefs(x);
  x=x.replace(new RegExp(LNK+String.raw`(\d+)`+LNK,"g"),(m,i)=>held[+i]);
  return x.replace(/  $/,'<br>');
}
const meta1=s=>inline(s).replace(/<br>$/,'');
const DELIVERY='납품 2026-08-10';   // 납품일 표기 — MD 메타(작성일) 원문은 건드리지 않는다
const poster=id=>`assets/evidence/${id}.jpg`;
const sourceData=q=>`<template class="source-marker">${esc(q.join('\n'))}</template>`;
// ── 임베드 라벨 CSV 자동 주입 — id→{date,views} 맵. player()/필름 카드가 정보 가치 없는 "CONTENT/REEL" 대신 실제 발행일·조회수를 라벨로 쓴다.
function parseCSV(text){
 const rows=[];let row=[],field='',inQ=false,i=0,n=text.length;
 while(i<n){const c=text[i];
  if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue}inQ=false;i++;continue}field+=c;i++;continue}
  if(c==='"'){inQ=true;i++;continue}
  if(c===','){row.push(field);field='';i++;continue}
  if(c==='\r'){i++;continue}
  if(c==='\n'){row.push(field);rows.push(row);row=[];field='';i++;continue}
  field+=c;i++;continue}
 if(field.length||row.length){row.push(field);rows.push(row)}
 return rows.filter(r=>r.length>1||r[0]);
}
const tagInfoMap=(()=>{
 const map={},csvPath=`${__dirname}/data/jonny_tags_multiaxis_260809.csv`;
 try{
  const raw=fs.readFileSync(csvPath,'utf8').replace(/^﻿/,'');
  const rows=parseCSV(raw),headers=rows[0];
  const iId=headers.indexOf('id'),iDate=headers.indexOf('date'),iViews=headers.indexOf('views');
  rows.slice(1).forEach(r=>{if(r[iId])map[r[iId]]={date:r[iDate],views:r[iViews]}});
 }catch(e){console.warn('[임베드 라벨] CSV 로드 실패 — 전건 폴백 라벨 사용:',e.message)}
 return map;
})();
const fmtViews=v=>{const n=Number(v);return Number.isFinite(n)&&v!==''?n.toLocaleString('en-US'):v};
const dateViewsLabel=id=>{const info=tagInfoMap[id];
 if(!info){console.warn(`[임베드 라벨] CSV에 없는 id — 폴백 라벨 사용: ${id}`);return null}
 return {date:info.date,views:fmtViews(info.views)};
};
let ceSeq=0;
function player(id,title,meta='',reading=''){
 const dv=dateViewsLabel(id);const flip=(++ceSeq)%2===0?' ce-flip':'';
 const labelL=dv?dv.date:(meta||'CONTENT'),labelR=dv?dv.views:'REEL';
 return `<figure class="content-evidence${flip}" id="content-${id}"><div class="media-frame"><img src="${poster(id)}" alt="${esc(title)} 콘텐츠 프레임"><div class="media-labels"><span>${esc(labelL)}</span><span>${esc(labelR)}</span></div><a class="play" href="https://www.instagram.com/reel/${id}/" target="_blank" rel="noopener" aria-label="인스타그램 원본 보기">▶</a></div><figcaption><span class="overline">CONTENT EVIDENCE</span><h4>${esc(title)}</h4>${reading?`<p>${esc(reading)}</p>`:''}<a href="https://www.instagram.com/reel/${id}/" target="_blank" rel="noopener">원본 콘텐츠 보기 ↗</a></figcaption></figure>`;
}
function pillarsBlock(header,items,footer){
 return `<div class="pillars"><header>${esc(header)}</header>${items.map(x=>`<div><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('')}<footer>${esc(footer)}</footer></div>`;
}
function stackedBar(segments){ // [[라벨,%,색토큰],...] — CHART 3-2: 100% 누적 단일 가로 막대
 return `<div class="stacked-bar"><div class="stacked-bar-track">${segments.map(s=>`<i class="seg-${s[2]}" style="width:${s[1]}%">${s[1]>=6?`<b>${s[1]}%</b>`:''}</i>`).join('')}</div><ul class="stacked-bar-legend">${segments.map(s=>`<li><i class="seg-${s[2]}"></i><b>${s[0]}</b><span>${s[1]}%</span></li>`).join('')}</ul></div>`;
}
function graphic(id,q){
 const original=sourceData(q); let body='';
 const items=(arr,cls='flow-items')=>`<div class="${cls}">${arr.map((x,i)=>`<div><small>0${i+1}</small><b>${x[0]}</b><span>${x[1]||''}</span></div>`).join('')}</div>`;
 if(id==='1-1') body=`<div class="axis-legend">${[['A','효과','유입 · 호감·공감 · 권위 · 문제 인식 · 제품 이해 · 행동'],['B','기억이 남은 곳','조니 개인 J · 브랜드 자격 X · 피부 문제 C · 제품 P · 어디에도 남지 않음 N'],['C','전이','비전이 · 조건부 전이 · 직접 전이'],['D','역할','발견 · 검증 · 선택 · 정착 · 퍼널 외 (시트 표기 유입 · 신뢰 · 전환 · 혼합)'],['E','위험','평판 파급 없음 · 인물 평판 파급 · 브랜드 인접 파급']].map(x=>`<div><i>${x[0]}</i><b>${x[1]}</b><span>${x[2]}</span></div>`).join('')}</div>`;
 else if(id==='2-1') body=`<div class="layer-table"><div class="layer-rows">${[['대중','센 언니·엄마·관계 판별자','도달과 캐릭터 기억'],['사업','현실적인 대표·워킹맘·실행가','사업가 권위'],['카테고리','36년 당사자·환자 대변자','공감과 자격'],['브랜드','고객을 가려 받는 개발자·판매자','제품 선택 이유']].map(x=>`<div class="has-tip" tabindex="0" data-tip="${esc(x[2])}"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="layer-brackets"><div class="bracket muted"><i class="tick top"></i><i class="tick bottom"></i><span>현재 노출 집중</span></div><div class="bracket key"><i class="tick top"></i><i class="tick bottom"></i><span>제품 선택에 가까움 · 상대적으로 좁음</span></div></div></div>`;
 else if(id==='2-2') body=pillarsBlock('신뢰가 완성되는 조건',[['공감','고객의 절박함을 살아본 경험'],['판단','치료·화장품·제품 적합성을 구분하는 능력'],['손해 감수','맞지 않는 고객에게 판매하지 않는 행동']],'AD솔루션의 대표인 조니를 믿을 이유');
 else if(id==='3-1') body=`<div class="concentration"><div class="total"><b>31,348,361</b><span>전체 조회수</span></div>${[['상위 10% · 24편',78.6],['나머지 90% · 220편',21.4],['상위 20% · 49편',88.6],['나머지 80% · 195편',11.4]].map(x=>`<div class="hbar"><b>${x[0]}</b><i><em style="width:${x[1]}%"></em></i><span>${x[1]}%</span></div>`).join('')}</div>`;
 else if(id==='3-2') body=stackedBar([['비전이 · 186편',93.7,'a'],['조건부 전이 · 16편',1.4,'b'],['직접 전이 · 42편',4.9,'c']]);
 else if(id==='3-3') body=mirror();
 else if(id==='4-1') body=`<div class="flow5"><div class="flow5-start"><div class="flow5-card start"><b>지금 겪고 있는 상태로 부릅니다</b><span>같은 사람도 계절과 컨디션에 따라 다른 상태를 오갈 수 있고, 같은 제품도 그 상태에 따라 선택이 달라질 수 있기 때문입니다.</span></div></div><div class="flow5-connector"><i class="stem"></i><i class="rail"></i><div class="drops"><i></i><i></i><i></i><i></i><i></i></div></div><div class="flow5-cols">${[['무엇을 발라도 따가움','먼저 멈출 것','“또 따가우면 어떡하지?” — 무엇을 중단할지, 한 부위에서 어떻게 확인할지, 사용 직후 어떤 감각을 관찰할지, 언제 다시 시도하지 말아야 할지.'],['갑자기 붉고 뜨거움','자극 원인과 진료선','“지금 당장 뭘 해야 하지?” — 일시적인 열감과 진료가 필요한 상태를 구분하고, 기능성 제품을 더 얹지 않아야 할 때.'],['보습해도 당기고 긁음','보습과 치료의 순서','“보습을 했는데 왜 계속 건조하지?” — 사용량·제형·씻는 방법·바르는 순서·환경을 함께 보고, 보습만으로 해결하려 해서는 안 되는 상태.'],['기능성을 쉬어야 함','회복기 최소 단계','“아무것도 안 바를 수는 없는데?” — 무엇을 빼고 무엇만 남길지, 기능성 제품을 다시 시작할 때 어떤 순서로 확인할지.'],['아이와 함께 사용','보호자 판단과 관찰','“아이에게도 괜찮을까?” — 연령, 현재 피부 상태, 패치 테스트, 병원 상담이 먼저인 경우.']].map(x=>`<div class="flow5-col"><span class="flow5-chip">${x[0]}</span><div class="flow5-card"><b>${x[1]}</b><span>${x[2]}</span></div></div>`).join('')}</div></div>`;
 else if(id==='5-1') body=`<div class="acts3"><div class="acts3-axis" style="grid-template-columns:repeat(12,1fr)"><span style="grid-column:1/6">브랜드 비공개</span><span style="grid-column:6/11">브랜드 공개</span><span style="grid-column:11/13">현재(NOW)</span></div><div class="acts3-body" style="grid-template-columns:repeat(12,1fr)"><div class="acts3-now"></div><small class="acts3-period" style="grid-row:1;grid-column:1/8">브랜드 비공개</small><div class="acts3-bar act1-solid" style="grid-row:1;grid-column:1/8"><small>1막</small><b>브랜드를 숨긴 바이럴</b><span>제품과 브랜드를 밝히지 않고 사람을 모음</span></div><div class="acts3-bar act1-tail" style="grid-row:1;grid-column:8/13"><small class="quote">“앞으로도 계정의 미디어 엔진으로 보존해야 합니다” — 원고 5-3</small></div><small class="acts3-period" style="grid-row:2;grid-column:6/13">브랜드 공개</small><div class="acts3-bar act2" style="grid-row:2;grid-column:6/13"><small>2막</small><b>브랜드 공개</b><span>제품과 AD솔루션을 밝힘</span></div><small class="acts3-period" style="grid-row:3;grid-column:10/13">현재(NOW)</small><div class="acts3-bar key" style="grid-row:3;grid-column:10/13"><small>3막 · NOW</small><b>의미 전이</b><span>센 언니·엄마·사업가 조니 → 당사자·환자 대변자·제품 판별자 조니 → AD솔루션</span></div></div></div>`;
 else if(id==='6-1') body=engineMatrix();
 else if(id==='7-1') body=items([['대상을 자른다','“피부 좋은 사람은 지나가세요”'],['통념을 반문한다','당연하다고 믿은 것을 뒤집음'],['말할 자격을 붙인다','당사자 경험과 이력'],['이유를 분류한다','상태와 선택을 구분'],['행동을 짧게 남긴다','멈춤·확인·선택']], 'sequence sequence-mark');
 else if(id==='8-1') body=`<div class="allow-deny"><div><small>ALLOW</small>${['판단 구조','보호 기준','당사자 자격','실제 사용 장면'].map(x=>`<b>○ ${x}</b>`).join('')}</div><strong>제품을 지우면<br>갈등과 해결이<br>달라지는가?</strong><div><small>DENY</small>${['이야기 종료 후 제품명','무관한 공감 뒤 할인','바이럴 훅만 복사한 피부 강의'].map(x=>`<b>× ${x}</b>`).join('')}</div></div>`;
 else if(id==='9-1') body=items([['1장','고객 장면'],['2장','무엇을 구분할지'],['3장','이유'],['4장','근거'],['5장','근거'],['6장','제품 위치·비적합 조건'],['7장','다음 행동']], 'carousel');
 else if(id==='10-1') body=pillarsBlock('제품을 믿을 이유',[['확신','상황에 따라 바뀌지 않는 반복된 기준'],['역량','당사자 경험·환자 대변 활동·제품 개발과 판별'],['선의','판매보다 고객의 상태를 먼저 두는 행동']],'AD솔루션의 신뢰 구조');
 else if(id==='11-1') body=`<div class="translate-table"><div class="translate-q">“아토피가 아니어도 써도 되나요?”</div><div class="translate-rows">${[['개인 계정','조니가 상태를 구분하는 사람의 설명'],['브랜드 계정','적합·비적합·사용·중단을 저장하는 답변서'],['광고','확인된 문제 장면과 제품 선택 이유를 압축'],['자사몰','제품 사실과 구매 조건을 최종 확인']].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div><div class="translate-foot">→ 최종 선택으로 수렴</div></div>`;
 else if(id==='13-1') body=`<div class="experiment">${['가설','이번 게시물의 엔진','기존 시도와의 차이','실행','판독 지표','채택 기준','폐기 기준','다음 반복일'].map((x,i)=>`<div><small>0${i+1}</small><b>${x}</b><span></span></div>`).join('')}</div>`;
 return `<figure class="visual visual-${id}${WIDEFIG.has(id)?' visual--wide':''}">${original}<div class="visual-head"><span>FIGURE ${id}</span><b>${esc((q[0].match(/\|\s*(.*?)\]/)||[])[1]||'')}</b></div><div class="visual-body">${body}${aside(captionFor(id))}</div></figure>`;
}
function captionFor(id){const m={
 // 1-1 캡션 삭제 — 직전 문단('한 콘텐츠를 다섯 축으로 함께 읽었습니다…')과 같은 말. 9-1은 근사 문장이 9-2 끝(절이 다름·비인접)이라 유지
 '2-1':'현재 노출은 대중·사업 페르소나에 넓게 분포하고, 제품 선택에 가까운 2개 층은 상대적으로 좁습니다.',
 '2-2':'공감·판단·손해 감수가 함께 보일 때 AD솔루션의 대표인 조니를 믿을 이유가 완성됩니다.',
 '3-1':'총조회수는 계정의 강한 도달력을 보여주지만, 조회의 대부분은 소수 바이럴 콘텐츠에 집중돼 있습니다.',
 '3-2':'조회수의 93.7%가 브랜드로 직접 이전되지 않는 콘텐츠에서 발생했습니다.',
 '3-3':'편수와 조회수 기여의 비대칭이 현재 계정에서 관심이 머무는 곳을 보여줍니다.',
 '4-1':'고객은 질병명보다 오늘 겪는 상태로 들어오며, 각 입구에는 서로 다른 다음 판단이 필요합니다.',
 '5-1':'브랜드 공개 이후의 과제는 노출 확대가 아니라 조니의 의미를 AD솔루션으로 옮기는 3막입니다.',
 '6-1':'3개 엔진은 동시에 돌아가지만 한 게시물에는 하나의 주 임무를 부여합니다.',
 '7-1':'조니의 강한 어법은 말끝보다 대상을 자르고 판단을 공개하는 순서에서 나옵니다.',
 '8-1':'제품이 갈등과 해결을 바꾸지 못한다면 의미 전이가 아니라 이야기 뒤에 붙은 판매 꼬리표입니다.',
 '9-1':'캐러셀은 도달을 키우는 포맷이 아니라, 들어온 사람이 자기 상태를 확인하게 하는 정적 랜딩페이지입니다.',
 '10-1':'반복되는 기준, 문제를 구분하는 능력, 판매보다 상태를 먼저 보는 행동이 제품 신뢰를 받칩니다.',
 '11-1':'같은 질문을 복사하지 않고 각 채널의 역할에 맞게 번역해 최종 선택으로 모읍니다.',
 '13-1':'아이디어를 의견으로 남기지 않고 채택과 폐기가 가능한 실험 단위로 바꿉니다.'}; return m[id]||''}
function mirror(){return `<div class="mirror"><header><span>편수 비중</span><span>기억이 남은 곳</span><span>조회수 기여</span></header>${[['조니 개인 J',180,73.8,91.6],['브랜드 자격 X',23,9.4,4.7],['비연결 N',10,4.1,2.5],['제품 P',24,9.8,1.0],['피부 문제 C',7,2.9,0.2]].map((x,i)=>`<div class="mirror-row ${i===0?'key':''}"><span>${x[2].toFixed(1)}% <i style="width:${x[2]}%"></i></span><b>${x[0]}<small>${x[1]}편</small></b><span><i style="width:${x[3]}%"></i> ${x[3].toFixed(1)}%</span></div>`).join('')}</div>`}
function engineMatrix(){const rows=[['미디어 엔진','조회·비팔로워 도달·팔로우','1 / 3',''],['전이 엔진','피부·자격 언급·프로필 행동','2 / 4','accent'],['선택·정착 엔진','저장·질문·웹 이동·반복 문의 감소','3 / 5','']];
 return `<div class="engine-matrix"><div class="engine-matrix-head"><span></span><span>DISCOVER</span><span>UNDERSTAND</span><span>CHOOSE</span><span>STAY</span></div><div class="engine-matrix-body">${rows.map(r=>`<div class="engine-matrix-row"><div class="engine-label"><b>${r[0]}</b><span>${r[1]}</span></div><div class="engine-track"><i class="${r[3]}" style="grid-column:${r[2]}"></i></div></div>`).join('')}</div></div>`}
// TABLE 블록 — 라인 내 ' | ' 구분 열. 형식 라인의 [헤더/헤더/...]와 "가운데 열"/"마지막 열" 강조 지시를 따른다.
// 2-1·5-1 캡션은 삭제 — 우측 트랙으로 올린 본문 해설(↳)과 문장이 겹쳐 같은 스택에 두 번 뜬다
const tableCaptions={};
function tableBlock(id,q){
 const title=(q[0].match(/\|\s*(.*?)\]/)||[])[1]||'';
 const fmt=q[q.length-1];
 const rows=q.slice(1,-1).map(l=>l.split('|').map(x=>x.trim()));
 const bracket=fmt.match(/\[([^\]]+)\]/);
 const headers=bracket?bracket[1].split('/').map(x=>x.trim()):[];
 const n=headers.length||(rows[0]?rows[0].length:0);
 const emph=/가운데 열/.test(fmt)?Math.floor(n/2):/마지막 열/.test(fmt)?n-1:-1;
 return `<figure class="visual table-visual" id="tbl-${id}">${sourceData(q)}<div class="visual-head"><span>TABLE ${id}</span><b>${inline(title,1)}</b></div><div class="visual-body"><div class="table-wrap"><table class="tbl-emph">${headers.length?`<tr>${headers.map((h,i)=>`<th${i===emph?' class="emph"':''}>${inline(h,1)}</th>`).join('')}</tr>`:''}${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i===emph?' class="emph"':''}>${inline(c,1)}</td>`).join('')}</tr>`).join('')}</table></div>${aside(tableCaptions[id]||'')}</div></figure>`;
}
// ── 편입 컴포넌트 ───────────────────────────────────────────────
// 개작 전/후 2단 카드. 필드는 스펙 블록 안에서 **META** **LABEL** **FLAG** **REF** **BEFORE** **AFTER** 로 준다.
// 대사 한 줄이 `[마지막 8초]`처럼 대괄호로 시작하면 구간 지시자로 보고 대사와 구분해 표시한다.
const speechLine=x=>{const c=x.match(/^\[([^\]]+)\]\s*(.*)$/);
 return c?`<i class="rw-cue">[${esc(c[1])}]</i>${c[2]?' '+inline(c[2],1):''}`:inline(x,1)};
function rewriteBlock(id,q){
 const title=(q[0].match(/\|\s*(.*?)\]/)||[])[1]||'';
 let meta='',flag='',ref=null,labels=['개작 전','개작 후'],cur=null;const before=[],after=[];
 for(let k=1;k<q.length;k++){const l=q[k];let m;
  if(m=l.match(/^\*\*META\*\*\s*(.*)$/)){meta=m[1];continue}
  if(m=l.match(/^\*\*FLAG\*\*\s*(.*)$/)){flag=m[1];continue}
  if(m=l.match(/^\*\*LABEL\*\*\s*(.*)$/)){labels=m[1].split('/').map(x=>x.trim());continue}
  if(m=l.match(/^\*\*REF\*\*\s*(.*)$/)){ref=m[1].split('|').map(x=>x.trim());continue}
  if(/^\*\*BEFORE\*\*\s*$/.test(l)){cur=before;continue}
  if(/^\*\*AFTER\*\*\s*$/.test(l)){cur=after;continue}
  if(cur&&l.trim()) cur.push(l);
 }
 const side=(arr,cls,label)=>`<div class="rw-side ${cls}"><small>${inline(label,1)}</small><p>${arr.map(speechLine).join('\n')}</p></div>`;
 let refHtml='';
 if(ref){const has=fs.existsSync(`${__dirname}/${poster(ref[0])}`);
  // 사례 실물(#content-…)은 본편에만 있다. 부록에서 부를 땐 본편 페이지를 새 탭으로 연다(읽던 부록 자리를 잃지 않게).
  const ext=inAppendix(),href=ext?`${MAIN_PAGE}#content-${ref[0]}`:`#content-${ref[0]}`;
  refHtml=`<a class="rw-ref" href="${href}"${ext?extAttrRef:''}>${has?`<img src="${poster(ref[0])}" alt="">`:''}<em>${inline(ref[1]||'',1)}</em><span>3부 사례 보기 ↗</span></a>`}
 return `<figure class="rewrite${flag?' rw-boundary':''}" id="rw-${id}">${sourceData(q)}<div class="rw-head"><span>${flag?esc(flag):'REWRITE'} ${id}</span><b>${inline(title,1)}</b></div><div class="visual-body"><div class="rw-pair">${side(before,'rw-before',labels[0])}${side(after,'rw-after',labels[1]||'개작 후')}</div>${meta?`<figcaption class="rw-foot"><span>${inline(meta,1)}</span></figcaption>`:''}${aside('',refHtml?`<p class="v-ptr v-ptr--ref">${refHtml}</p>`:'')}</div></figure>`;
}
// 표현 치환 사전. **PAIR nn** 아래 **BEFORE/AFTER/WHY/NOTE/LINK** 를 반복한다(BEFORE·AFTER는 여러 줄 가능).
function swapBlock(id,q){
 const title=(q[0].match(/\|\s*(.*?)\]/)||[])[1]||'';
 const pairs=[];let p=null;
 for(let k=1;k<q.length;k++){const l=q[k];let m;
  if(m=l.match(/^\*\*PAIR\s+(\S+)\*\*\s*$/)){p={no:m[1],before:[],after:[],why:'',note:'',link:''};pairs.push(p);continue}
  if(!p)continue;
  if(m=l.match(/^\*\*BEFORE\*\*\s*(.*)$/)){p.before.push(m[1]);continue}
  if(m=l.match(/^\*\*AFTER\*\*\s*(.*)$/)){p.after.push(m[1]);continue}
  if(m=l.match(/^\*\*WHY\*\*\s*(.*)$/)){p.why=m[1];continue}
  if(m=l.match(/^\*\*NOTE\*\*\s*(.*)$/)){p.note=m[1];continue}
  if(m=l.match(/^\*\*LINK\*\*\s*(.*)$/)){p.link=m[1];continue}
 }
 return `<figure class="swap" id="swap-${id}">${sourceData(q)}<div class="rw-head"><span>SWAP ${id}</span><b>${inline(title,1)}</b></div><div class="visual-body"><ol class="swap-list">${pairs.map(x=>`<li><i>${esc(x.no)}</i><div class="swap-cols"><div class="swap-side swap-before"><small>개작 전</small><p>${x.before.map(t=>inline(t,1)).join('\n')}</p></div><div class="swap-side swap-after"><small>개작 후</small><p>${x.after.map(t=>inline(t,1)).join('\n')}</p></div></div><p class="swap-why"><b>이래서 더 먹힌다</b>${inline(x.why,1)}</p>${x.note?`<p class="swap-note">${inline(x.note,1)}</p>`:''}${x.link?`<p class="swap-link">${inline(x.link,1)}</p>`:''}</li>`).join('')}</ol>${aside('')}</div></figure>`;
}
// 스크린샷 갤러리 — 각 라인은 `이미지경로 | 라벨`. 라벨은 이미지 위 오버레이로 얹는다.
function imageGallery(id,q){
 const title=(q[0].match(/\|\s*(.*?)\]/)||[])[1]||'';
 const items=q.slice(1).map(l=>l.trim()).filter(l=>l&&!/^\*\*/.test(l)).map(l=>{const i=l.indexOf('|');return i<0?[l.trim(),'']:[l.slice(0,i).trim(),l.slice(i+1).trim()]});
 items.forEach(x=>{if(!fs.existsSync(`${__dirname}/${x[0]}`))console.warn(`[IMAGE GALLERY ${id}] 파일 없음: ${x[0]}`)});
 return `<div class="visual film img-gallery" id="gal-${id}">${sourceData(q)}<div class="film-head"><b>${inline(title,1)}</b></div><div class="visual-body"><div class="film-rail">${items.map(x=>`<figure class="gal-card"><img src="${esc(x[0])}" alt="${esc(x[1])}" loading="lazy"><figcaption>${esc(x[1])}</figcaption></figure>`).join('')}</div>${aside('')}</div></div>`;
}
// 레퍼런스 계정 북마크 — `핸들 | 표시명 | 요약 | url`. 썸네일은 빌드 타임 캐시(assets/reference/profiles)만 사용한다.
function bookmarkBlock(id,q){
 const rows=q.slice(1).map(l=>l.trim()).filter(l=>l&&!/^\*\*/.test(l)).map(l=>l.split('|').map(x=>x.trim()));
 return `<div class="bookmark-grid" id="bm-${id}">${sourceData(q)}${rows.map(r=>{
  const [handle,name,desc,url]=r;
  const img=`assets/reference/profiles/${handle}.jpg`;
  const has=fs.existsSync(`${__dirname}/${img}`);
  if(!has)bmMissing.push(handle);
  const host=(url||'').replace(/^https?:\/\//,'').replace(/\/$/,'');
  const initial=esc((name||handle).trim().charAt(0));
  return `<a class="bookmark" href="${esc(url)}" target="_blank" rel="noopener"><div class="bm-main"><b class="bm-name">${esc(name)} <span>@${esc(handle)}</span></b><span class="bm-kind">Instagram profile</span><p class="bm-desc">${esc(desc)}</p><span class="bm-url"><svg viewBox="0 0 20 20" width="11" height="11" aria-hidden="true"><path d="M8.4 11.6L11.6 8.4M6.8 13.2l-1.9 1.9a2.3 2.3 0 01-3.2-3.2l1.9-1.9M13.2 6.8l1.9-1.9a2.3 2.3 0 013.2 3.2l-1.9 1.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>${esc(host)}</span></div><div class="bm-thumb">${has?`<img src="${img}" alt="" loading="lazy">`:`<span class="bm-ph"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg><b>${initial}</b></span>`}</div></a>`;
 }).join('')}${aside('')}</div>`;
}
function embedVisual(id,q){
 const data=sourceData(q);
 // 한 지점에 여러 편이 몰릴 때는 격자로 쌓지 않고 가로 필름스트립으로 눕힌다
 if(id==='3-2'){const items=[['DUAXnreCUIj','육아·가족의 실제 장면','관계 동일시 · 비전이'],['DVNq_ItiS3L','관계와 가족 공감','관계 동일시 · 비전이'],['DV-9ZGjCcsa','“둘째들 모여봐”','캐릭터 선명화 · 비전이'],['DUfduyujOGS','관계 판별자 조니','캐릭터 선명화 · 비전이']];
  return `<div class="visual film film-grid">${data}<div class="film-head"><b>조니 개인에게 큰 도달을 만든 육아·관계 콘텐츠</b></div><div class="visual-body"><div class="film-rail">${items.map(x=>{const dv=dateViewsLabel(x[0]);return `<a class="film-card" id="content-${x[0]}" href="https://www.instagram.com/reel/${x[0]}/" target="_blank" rel="noopener"><span class="film-frame"><img src="${poster(x[0])}" alt="${esc(x[1])} 콘텐츠 프레임"><i>▶</i></span><b>${esc(x[1])}</b><em>${esc(x[2])}${dv?` · ${dv.date} · ${dv.views}`:''}</em></a>`}).join('')}</div>${aside('4편의 공통 판독 — 큰 주목 · 관계 동일시 · 조니 캐릭터 선명화 / 대체로 J3 · X0 · C0 · P0 / 비전이')}</div></div>`;}
 // 앞에서 이미 보여준 콘텐츠의 재언급은 별도 블록을 세우지 않고 본문 문장 안 칩으로 처리한다(아래 CREF)
 if(id==='7-1') return sourceData(q);
 const map={
  '3-1':['DW59GCwCekB','“월 삼천이 찍힌다고 그게 다 수익이냐”','13.4만','사업가 권위는 남지만 피부 판단과 제품 선택으로는 이어지지 않는 미디어 콘텐츠입니다.'],
  '3-3':['DYhhdVvJSCN','“피부가 원래 좋은 사람들은 제 영상 지금 보지 마세요”','','당사자 자격과 고객 상태가 같은 이야기 안에서 연결됩니다.'],
  '3-4':['DaAVMzJJ41Y','치료와 화장품의 경계를 구분한 콘텐츠','','제품을 팔기 전에 화장품이 개입할 수 없는 범위를 밝힙니다.'],
  '3-5':['DYRXexXJhQ0','환자 대변 활동이 카테고리 권위로 이어진 콘텐츠','','개인의 고통이 여러 환자의 문제를 대변하는 행동으로 이동합니다.'],
  '3-6':['Dac6-oPJaDq','“근데 너무 따가워”','','제품을 지우면 이야기의 해결도 함께 사라지는 직접 전이 콘텐츠입니다.']};
 const x=map[id]; return `<div class="visual visual-embed">${data}${player(x[0],x[1],x[2],x[3])}${aside('')}</div>`;
}

const editorialTitles={
 '서두. 먼저, 결론':'퍼스널브랜딩은 목적이 아니라,\n브랜드 선택 이유를 만드는 수단입니다.',
 '1부. 분석 대상과 읽는 법':'바이럴과 퍼스널브랜딩은 이 프로젝트의\n최종 목적이 아닙니다.',
 '2부. 조니는 브랜드 안에서 누구인가':'조니는 한 명이지만,\n콘텐츠에서 남는 조니는 4층입니다.',
 '3부. 244편이 보여준 현재 계정의 구조':'조회수 하나로는 콘텐츠가 남긴 것을\n설명할 수 없습니다.',
 '4부. AD솔루션은 무엇을 되돌려주는 브랜드인가':'고객에게 필요한 것은 더 많은 선택지가 아니라,\n다시 선택할 수 있는 기준입니다.',
 '5부. 브랜드를 숨긴 바이럴 이후의 3막 전략':'브랜드 공개 이후에는\n의미를 다시 학습시키는 3막이 필요합니다.',
 '6부. 하나의 퍼널이 아니라 3개의 콘텐츠 엔진':'한 계정을 하나의 퍼널이 아니라,\n3개의 콘텐츠 엔진으로 운영합니다.',
 '7부. 조니의 콘텐츠 보이스':'조니의 어법은 센 말이 아니라,\n판단의 순서입니다.',
 '8부. 바이럴을 브랜드로 옮기는 4가지 전이 장치':'전이는 제품을 언급하는 일이 아니라,\n같은 인과 안에 넣는 일입니다.',
 '9부. 선택을 돕는 콘텐츠':'고위험 구매일수록\n더 많은 증명이 필요합니다.',
 '10부. 신뢰를 만드는 원리와 브랜드 가드레일':'강한 화법은 고객을 누르는 힘이 아니라,\n잘못된 선택을 막는 보호여야 합니다.',
 '11부. 두 계정과 광고가 한 브랜드로 작동하는 법':'하나의 질문을 복사하지 않고,\n각 채널의 역할에 맞게 이어갑니다.',
 '12부. 전략 검증 사례 — 이 구조가 다른 브랜드에서 작동한 방식':'개인에게 형성된 인식이\n저절로 브랜드가 된 경우는 없습니다.',
 '13부. 대표님이 직접 판독할 수 있는 운영체계':'아이디어를 의견으로 남기지 않고,\n채택과 폐기가 가능한 실험으로 바꿉니다.',
 '에필로그. 조니에게서 시작하지만 조니에게만 머물지 않는 브랜드':'조니에게서 시작하지만,\n조니에게만 머물지 않는 브랜드.',
 '부록 A. 전이 장치 실물집':'전이 장치의 나머지 실물과\n경계 사례를 그대로 보존합니다.',
 '부록 B. 표현 검수 기준 — 규제와 치환':'약해지는 것이 아니라,\n더 강한 사실로 옮기는 것입니다.'
};
// 파트 오프너 — 부(部)마다 질문 한 줄만 (§CP12-4-L). 서두·에필로그·부록에는 붙이지 않는다.
const partQuestions={
 '1':'244편을 무엇으로 읽었는가.',
 '2':'조니라는 페르소나는 언제 AD솔루션을 선택할 이유가 되는가.',
 '3':'244편에서 무엇이 잘됐고, 무엇이 어디에 쌓였는가.',
 '4':'AD솔루션은 고객에게 무엇을 되돌려주는 브랜드인가.',
 '5':'브랜드 공개 이후, 지금은 어느 단계인가.',
 '6':'한 계정을 어떻게 3개의 엔진으로 운영하는가.',
 '7':'조니의 어법은 무엇으로 이루어져 있는가.',
 '8':'바이럴은 어떤 장치로 브랜드가 되는가.',
 '9':'구매 앞뒤의 판단을 무엇으로 돕는가.',
 '10':'강함은 어떻게 신뢰가 되는가.',
 '11':'두 계정과 광고는 어떻게 한 브랜드로 작동하는가.',
 '12':'이 구조는 다른 브랜드에서 실제로 작동했는가.',
 '13':'대표님은 무엇으로 채택과 폐기를 판독하는가.'
};
// 좌측 레일 7버킷(+부록). 전부 신 파트 번호 기준 연속 구간이라야 book-part 구획이 겹치지 않는다.
const groups=[
 {id:'start',no:'START',label:'문제 정의',parts:[0,1],desc:'바이럴로 얻은 주목이 AD솔루션의 선택 이유로 이동하고 있는가'},
 {id:'identity',no:'PART 01',label:'인물과 현재 진단',parts:[2,3],desc:'조니는 브랜드 안에서 누구이고, 244편은 무엇을 남겼는가'},
 {id:'brand',no:'PART 02',label:'브랜드 정의와 전략',parts:[4,5],desc:'AD솔루션은 무엇을 되돌려주는 브랜드이고, 다음 막은 무엇인가'},
 {id:'engine',no:'PART 03',label:'콘텐츠 엔진',parts:[6,7,8],desc:'한 계정을 3개 엔진으로 운영하고, 조니의 어법으로 전이를 만든다'},
 {id:'choice',no:'PART 04',label:'선택과 신뢰',parts:[9,10,11],desc:'선택을 돕고 신뢰를 지키며, 채널마다 다른 답을 준다'},
 {id:'verify',no:'PART 05',label:'검증과 실행',parts:[12,13],desc:'이 구조가 다른 브랜드에서도 작동했는가, 어떻게 반복하고 판독하는가'},
 {id:'end',no:'END',label:'조니 이후에도 남는 브랜드',parts:[14],desc:'조니에게서 시작하지만 조니에게만 머물지 않는 브랜드'},
 {id:'appendix',no:'',label:'실물집·검수 기준',parts:[15,16],desc:'전이 장치의 나머지 실물과 표현 검수 기준'}
];
// 레일 전용 축약 라벨 — 한 줄에 들어가는 길이. 본문 파트 제목은 그대로 둔다.
const railLabels=['서두','읽는 법','인물 진단','244편 구조','브랜드 테제','3막 전략','3개 엔진','보이스','전이 장치','선택 콘텐츠','신뢰·가드레일','계정 운영','검증 사례','운영 체계','에필로그','부록 A','부록 B'];
const railGroupLabels={start:'문제 정의',identity:'인물·진단',brand:'브랜드 전략',engine:'콘텐츠 엔진',choice:'선택과 신뢰',verify:'검증과 실행',end:'마무리',appendix:'부록'};
const groupOf=p=>groups.find(g=>g.parts.includes(p));
const groupKicker=g=>`<div class="book-part-kicker" id="group-${g.id}"><span>${g.no}</span><b>${g.label}</b></div>`;
const partOpener=n=>partQuestions[n]?`<div class="part-question"><p>${inline(partQuestions[n],1)}</p></div>`:'';
const numLabel=(title,part)=>{const mp=title.match(/^(\d+)부\./);if(mp)return mp[1].padStart(2,'0');
 const ma=title.match(/^부록\s*([A-Za-z])/);if(ma)return '부록 '+ma[1];
 if(/^서두/.test(title))return '00';if(/^에필로그/.test(title))return 'END';
 return String(part).padStart(2,'0')};
let out=[],nav=[],i=8,part=-1,open=false,currentGroup=null;
while(i<lines.length){let raw=lines[i],s=raw.trim();if(!s){i++;continue}if(/^---+$/.test(s)){i++;continue}
 const h=s.match(/^(#{1,6})\s+(.+)$/);if(h){const n=h[1].length,title=h[2];if(n===1){if(open)out.push('</section>');part++;const g=groupOf(part);if(!currentGroup||currentGroup.id!==g.id){if(currentGroup)out.push('</div>');currentGroup=g;out.push(`<div class="book-part" data-group="${g.id}">${groupKicker(g)}`)}const apMatch=title.match(/^부록\s*([AB])\b/);const id=apMatch?`appendix-${apMatch[1].toLowerCase()}`:`part-${part}`;open=true;nav.push([id,railLabels[part]||title.replace(/^\d+부\.\s*/, ''),g.id]);const ed=editorialTitles[title]||title;const pn=(title.match(/^(\d+)부\./)||[])[1];out.push(`<section class="chapter" id="${id}" data-group="${g.id}"><div class="section-no">${/^\d/.test(numLabel(title,part))?'PART ':''}${numLabel(title,part)} · ${esc(g.label)}</div>${pn?partOpener(pn):''}<h2 class="editorial-title">${inline(ed).replace(/\n/g,'<br>')}</h2>`);}else if(n===2){const nm=title.match(/^((?:[A-Za-z]|\d+)-\d+)\.\s*(.+)$/);
  seenBrand=new Set();inHeading=true;
  if(nm){const sub=/^12-/.test(nm[1])?nm[2].split(/\s—\s/):[nm[2]];
   const head=`<h3 id="s-${nm[1].toLowerCase()}"><i>${nm[1]}.</i> ${inline(sub[0])}</h3>`;
   out.push(sub.length>1?head+`\n<p class="sec-sub">${inline(sub.slice(1).join(' — '))}</p>`:head);
  }else out.push(`<h3>${inline(title)}</h3>`);
  inHeading=false;}else{const lv=Math.min(n+1,6),n3=n===3&&title.match(/^(\d+-\d+-\d+)\.\s*(.+)$/);out.push(n3?`<h4 class="sub-no"><i>${n3[1]}.</i> ${inline(n3[2])}</h4>`:`<h${lv}>${inline(title)}</h${lv}>`)}i++;continue}
 // 코드 펜스(```) — 복붙용 프롬프트 골격. 스타일은 팔레트 토큰 var()만 인라인으로 쓴다(CSS 파일 미변경).
 if(/^```/.test(s)){let code=[];i++;while(i<lines.length&&!/^\s*```/.test(lines[i]))code.push(lines[i++]);i++;
  out.push(`<pre class="promptbox">${esc(code.join('\n'))}</pre>`);continue}
 if(s.startsWith('>')){let q=[];while(i<lines.length&&lines[i].trim().startsWith('>'))q.push(lines[i++].trim().replace(/^>\s?/,''));const joined=q.join('\n');const sm=joined.match(/\[(BOOKMARK|IMAGE GALLERY|INFOGRAPHIC|CHART|TABLE|WIREFRAME|INTERACTION RULE|REWRITE|SWAP|EMBED(?: GALLERY| REFERENCE)?)\s+([\w-]+)/);if(sm){const id=sm[2],t=sm[1];out.push(t==='BOOKMARK'?bookmarkBlock(id,q):t==='IMAGE GALLERY'?imageGallery(id,q):t==='REWRITE'?rewriteBlock(id,q):t==='SWAP'?swapBlock(id,q):t==='TABLE'?tableBlock(id,q):t.startsWith('EMBED')?embedVisual(id,q):graphic(id,q));}else if(/^["“]/.test(q[0])){// 따옴표로 시작하면 발화 인용(voice) — cite 줄은 260810 낙타 확정으로 MD에서 제거됨
  const body=q.filter(l=>!/^—\s/.test(l));out.push(`<blockquote class="voice"><p>${body.map(t=>inline(t)).join('<br>')}</p></blockquote>`)}else out.push(`<blockquote>${q.map(t=>inline(t)).join('<br>')}</blockquote>`);continue}
 if(s.startsWith('|')){let rows=[];while(i<lines.length&&lines[i].trim().startsWith('|'))rows.push(lines[i++].trim().slice(1,-1).split('|').map(x=>x.trim()));rows=rows.filter(r=>!r.every(c=>/^:?-{3,}:?$/.test(c)));out.push(`<div class="table-wrap"><table>${rows.map((r,ri)=>`<tr>${r.map(c=>`<${ri?'td':'th'}>${inline(c)}</${ri?'td':'th'}>`).join('')}</tr>`).join('')}</table></div>`);continue}
 const lm=s.match(/^(\d+\.|[-*])\s+(.+)$/);if(lm){const ol=/^\d/.test(lm[1]),items=[];while(i<lines.length){const m=lines[i].trim().match(ol?/^\d+\.\s+(.+)$/:/^[-*]\s+(.+)$/);if(!m)break;items.push(m[1]);i++}out.push(`<${ol?'ol':'ul'}>${items.map(x=>`<li>${inline(x)}</li>`).join('')}</${ol?'ol':'ul'}>`);continue}
 let p=[s];i++;while(i<lines.length){const n=lines[i].trim();if(!n||/^#{1,6}\s/.test(n)||/^---+$/.test(n)||n.startsWith('>')||n.startsWith('|')||n.startsWith('```')||/^(\d+\.|[-*])\s+/.test(n))break;p.push(n);i++}
 {const tx=p.join(' ');
  const prevIdx=out.length-1,prevHtml=prevIdx>=0?out[prevIdx]:'';
  const attachToPara=(frag)=>{
   const m=prevHtml.match(/^<p(?: class="([^"]*)")?>([\s\S]*)<\/p>$/);
   if(!m)return false;
   out[prevIdx]=`<p class="${((m[1]||'')+' has-margin-note').trim()}">${m[2]}${frag}</p>`;return true};
  // ↗ 참조·첨부 포인터는 전량 우측 트랙으로 (본문에 남기지 않는다).
  // 직전 블록이 못 받으면 뒤로 거슬러 올라가 받을 수 있는 가장 가까운 블록에 붙인다 — 본문 폴백은 최후 수단.
  if(tx.startsWith('↗')){
   const inner=inline(tx.slice(1).trim());
   let placed=false;
   for(let k=out.length-1;k>=0&&!placed;k--){
    const el=out[k];
    if(isVisualBlock(el)&&el.includes('<!--ASIDE-->')){out[k]=asideAdd(el,`<p class="v-ptr">${inner}</p>`);placed=true;break}
    const pm=el.match(/^<p(?: class="([^"]*)")?>([\s\S]*)<\/p>$/);
    if(pm){out[k]=`<p class="${((pm[1]||'')+' has-margin-note').trim()}">${pm[2]}<span class="margin-note margin-note--ptr">${inner}</span></p>`;placed=true;break}
    if(/^<(h\d|section|div class="book-part)/.test(el))break;   // 절·부 경계를 넘어가지 않는다
   }
   if(!placed){out.push(`<p class="doc-link"><span>↗</span> ${inner}</p>`);strayPtr.push(tx.slice(0,44))}
  }
  else if(tx.startsWith('※')){
   const noteHtml=`<span class="margin-note">${inline(tx.replace(/^※\s*/,''))}</span>`;
   if(!attachToPara(noteHtml))out.push(`<p class="has-margin-note">${noteHtml}</p>`);
  }
  // 라벨 문단은 목록형 불릿으로 — 개작 카드(해설·발행 전 확인·채택 기준)와 12부 사례 6항목(**라벨** — 내용)
  else if(/^\*\*(해설|발행 전 확인|채택 기준)\.\*\*/.test(tx)||/^\*\*[^*]+\*\*\s*—\s/.test(tx)){
   labelBullets++;out.push(`<p class="label-bullet">${inline(tx)}</p>`);
  }
  // ↳ 로 시작하는 문단 = 바로 위 도해·표의 판정·해설. 우측 주석 스택으로 보낸다(폴백은 도해 아래)
  else if(tx.startsWith('↳')){
   const body1=tx.replace(/^↳\s*/,''),frag=`<div class="v-note">${sentBlocks(inline(body1))}</div>`;
   if(prevIdx>=0&&isVisualBlock(prevHtml)){out[prevIdx]=asideAdd(prevHtml,frag);movedAside.push(body1.length>46?body1.slice(0,46)+'…':body1)}
   else out.push(`<p>${inline(body1)}</p>`);
  }
  else out.push(`<p>${inline(tx)}</p>`);}}
if(open)out.push('</section>');if(currentGroup)out.push('</div>');
// ── 부록 A·B 슬라이스 분리 — 본편은 에필로그로 끝난다 ──
const apStart=out.findIndex(x=>x.startsWith('<div class="book-part" data-group="appendix"'));
let apSlice=[];
if(apStart>=0){apSlice=out.slice(apStart+1).filter(x=>x!=='</div>');out=out.slice(0,apStart)}
const apBIdx=apSlice.findIndex(x=>x.startsWith('<section class="chapter" id="appendix-b"'));
const panelA=(apBIdx>=0?apSlice.slice(0,apBIdx):apSlice).join('\n');
const panelB=(apBIdx>=0?apSlice.slice(apBIdx):[]).join('\n');
// 소제목 + 바로 뒤 인용문 = 선언 블록(핵심 질문 · 브랜드 테제)으로 합친다
let body=out.join('\n');
// h3+인용문 = statement로 합치되, 원래 h3의 제목 텍스트는 sr-only h3로 남겨 접근성 트리·아웃라인에서 계속 잡히게 한다(§4-2 브랜드 테제 등)
body=body.replace(/<h3(\s+id="[^"]*")?>(?:<i>([^<]*)<\/i>)?([^\n]*?)<\/h3>\n<blockquote>([^\n]*?)<\/blockquote>/g,(m,idAttr,no,t,q)=>`<h3 class="sr-only"${idAttr||''}>${((no||'')+t).trim()}</h3><div class="statement"><small>${(no||'')+t}</small><p>${q}</p></div>`);
// 서두 첫머리(에디토리얼 타이틀 바로 뒤 인용 3행) = "한 화면 판정" — statement급 조판으로
body=body.replace(/(<h2 class="editorial-title">[\s\S]*?<\/h2>)\n<blockquote>([\s\S]*?)<\/blockquote>/,(m,h,qq)=>`${h}<div class="statement lead-statement"><p>${qq}</p></div>`);
// 서두 "그러기 위해 필요한 6가지" — 타이포 숫자(01~06) + 숫자 열 고정폭, 텍스트 열 정렬
body=body.replace(/(<h3>그러기 위해 필요한 6가지<\/h3>)\n<ol>([\s\S]*?)<\/ol>/,(m,h,inner)=>{
 let k=0;
 const lis=inner.replace(/<li>([\s\S]*?)<\/li>/g,(mm,t)=>`<li><i class="badge-no">${String(++k).padStart(2,'0')}</i><span class="badge-txt">${t}</span></li>`);
 return `${h}\n<ol class="badge-list">${lis}</ol>`;
});
// 8-3 대상 호명 훅 — 이미 임베드한 콘텐츠의 재언급은 문장 안 칩 + 호버 미리보기로
// 미리보기 문구는 data-meta로 넣는다(본문 텍스트에 섞이면 안 됨)
const CREF=[
 ['DYhhdVvJSCN','“피부가 원래 좋은 사람들은 제 영상 지금 보지 마세요”','#content-DYhhdVvJSCN','3부 사례 · 당사자 자격과 고객 상태가 연결된 콘텐츠'],
 ['DV-9ZGjCcsa','“둘째들 모여봐”','#content-DV-9ZGjCcsa','3부 사례 · 관계 콘텐츠 · 비전이'],
 ['DVaj7-vkYSo','“힘든 엄마들 잘 봐”','https://www.instagram.com/reel/DVaj7-vkYSo/','원본 보기 ↗ · 대상 호명 훅']
];
const cref=(id,txt,href,meta)=>{const has=fs.existsSync(`${__dirname}/${poster(id)}`);
 return `<a class="cref hookq" href="${href}"${href.startsWith('#')?'':' target="_blank" rel="noopener"'} tabindex="0">${txt}<i data-meta="${esc(meta)}">${has?`<img src="${poster(id)}" alt="">`:''}</i></a>`};
body=body.replace(/<p>([^\n]*처럼 조니는 모두에게 인사하지 않습니다[^\n]*)<\/p>/,(m,t)=>{
 for(const [,txt] of CREF) t=t.replace(txt,`<span class="hookq">${txt}</span>`);
 const trig=CREF.map(([id,txt,href,meta])=>cref(id,txt,href,meta)).join('');
 return `<p class="has-margin-note">${t}<span class="margin-note margin-note--cref"><b>이미 본 콘텐츠</b>${trig}</span></p>`});
// ── 부록 페이지는 독립 정본이다 (낙타 확정 260810) ──────────────────────────
// 예전에는 여기서 panelA/panelB/rail 을 cp10_appendix_read.html 의 BUILD 마커 안에 주입했다.
// 그 구조에서는 부록을 손으로 고친 뒤 빌드를 한 번만 돌려도 편집이 MD 원문으로 덮여 사라진다.
// 지금 렌더러가 쓰는 파일은 cp10_full_report.html · cp10_mark.html 둘뿐이고,
// 부록 HTML 은 **쓰지 않는다**. 아래 검증 구간에서 읽기 전용으로만 열어 링크·팔레트를 대조한다.
// MD 정본(CP10 …v3)의 부록 A·B 섹션은 그대로 보관하되 본편 본문에서는 잘라낸다(위 슬라이스).
if(!MARK&&panelA)console.log(`[부록] 독립 페이지 — MD 부록 A·B(${(panelA.length+panelB.length).toLocaleString()}자)는 본편에서 제외만 하고 주입하지 않음`);
const css=fs.readFileSync('/Users/nakta/nakta/도구/brand_guide/ceojonnyentp/guideline/cp10_full_style.css','utf8');
const extAttr=' target="_blank" rel="noopener"';
// 부록 레일 — 부록 페이지의 실제 탭 구조에서 직접 뽑는다 (CONVENTIONS §12-14).
// 부록 탭이 바뀌면 본편 레일이 자동으로 따라온다. 뽑지 못하면 MD 헤딩 기반 subs 로 폴백.
const apTabs=[];
try{
 const _raw=fs.readFileSync(__dirname+"/"+APPENDIX_PAGE,"utf8");
 const _re=/<a class="rail-main" href="#(panel-[a-z-]+)" data-tab="[^"]*"><i><\/i><span>([^<]*)<\/span><b>([^<]*)<\/b><\/a>/g;
 let _m;while((_m=_re.exec(_raw)))apTabs.push([_m[1],_m[3]]);
}catch(e){}
const navHtml=groups.map(g=>{const ext=g.id==='appendix';
 const main=ext?`<a class="rail-main rail-ext" href="${APPENDIX_PAGE}"${extAttr}><i></i><span>${g.no}</span><b>${railGroupLabels[g.id]||g.label}</b></a>`
  :`<a class="rail-main" href="#group-${g.id}" aria-expanded="false"><i></i><span>${g.no}</span><b>${railGroupLabels[g.id]||g.label}</b></a>`;
 const subs=(ext&&apTabs.length?apTabs.map((t,i)=>`<a href="${APPENDIX_PAGE}#${t[0]}"${extAttr}><span>${String(i+1).padStart(2,'0')}</span><b>${esc(t[1])}</b></a>`)
  :nav.filter(x=>x[2]===g.id).map((x,i)=>`<a href="${ext?APPENDIX_PAGE+'#'+x[0]:'#'+x[0]}"${ext?extAttr:''}><span>${String(i+1).padStart(2,'0')}</span><b>${esc(x[1])}</b></a>`)).join('');
 return `<div class="rail-group${ext?' rail-group--ext':''}" data-rail-group="${g.id}">${main}<div class="rail-sub">${subs}</div></div>`}).join('');
const reportMap=`<section class="report-map"><div class="map-head"><h2>이 보고서는 7개의 질문을 따라갑니다.</h2></div><ol class="map-road">${groups.filter(g=>g.id!=='appendix').map(g=>`<li><a href="#group-${g.id}"><i></i><small>${g.no}</small><b>${g.label}</b><span>${g.desc}</span></a></li>`).join('')}</ol></section>`;
const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>조니 × AD솔루션 콘텐츠 브랜드 가이드 — CP10</title><meta property="og:title" content="조니 × AD솔루션 콘텐츠 브랜드 가이드"><meta property="og:description" content="조니에게 모인 영향력을, AD솔루션이 선택되는 이유로 — RE:FEEEL"><meta property="og:image" content="https://pub-e470c27e348244dab3f75fe3725a94a6.r2.dev/og-refeeel.png.png"><meta property="og:type" content="website"><meta property="og:url" content="https://naktaaa5.github.io/brand_guide/ceojonnyentp/guideline/cp10_full_report.html"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://pub-e470c27e348244dab3f75fe3725a94a6.r2.dev/og-refeeel.png.png"><meta name="twitter:title" content="조니 × AD솔루션 콘텐츠 브랜드 가이드"><meta name="twitter:description" content="조니에게 모인 영향력을, AD솔루션이 선택되는 이유로 — RE:FEEEL"><style>${css}</style></head><body><div class="progress"><i></i></div><header class="top"><div class="top-inner"><a href="#top">RE:FEEEL &amp; AD solution</a><span>CONTENT BRAND GUIDELINE · CP10</span></div></header><div class="shell"><section class="cover" id="top"><p class="cover-kicker">INSTAGRAM CONTENT BRAND GUIDELINE</p><h1>조니에게 모인 영향력을,<br>AD솔루션이 선택되는<br>이유로</h1><div class="cover-lead"><p>이미 증명된 조니의 도달력과 퍼스널브랜드가 AD솔루션의 자격과 제품 선택 이유로 이어지도록 만드는 콘텐츠 전략</p></div><div class="cover-meta"><span>${DELIVERY}</span></div></section>${reportMap}<div class="report-grid"><nav class="rail"><small>INDEX</small>${navHtml}</nav><main>${body}</main></div></div><footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a class="footer-logo" href="https://refeeel.com" target="_blank" rel="noopener">RE:FEEEL</a><b>조니 × AD솔루션<br>콘텐츠 브랜드 가이드</b></div><p>${DELIVERY}</p></div></footer><script>const pr=document.querySelector('.progress i'),ss=[...document.querySelectorAll('.chapter')],ls=[...document.querySelectorAll('.rail-sub a')],rgs=[...document.querySelectorAll('.rail-group')];const shown=x=>x.querySelector('.rail-sub').offsetParent!==null,sync=()=>rgs.forEach(x=>x.querySelector('.rail-main').setAttribute('aria-expanded',shown(x)));let prevG=null;const update=()=>{const d=document.documentElement;pr.style.width=(d.scrollTop/(d.scrollHeight-d.clientHeight)*100)+'%';let id=ss[0]?.id,g=ss[0]?.dataset.group;ss.forEach(s=>{if(s.getBoundingClientRect().top<150){id=s.id;g=s.dataset.group}});ls.forEach(a=>a.classList.toggle('on',a.hash==='#'+id));if(g!==prevG){prevG=g;rgs.forEach(x=>{x.classList.remove('open','closed');x.classList.toggle('active',x.dataset.railGroup===g)});sync()}};addEventListener('scroll',update,{passive:true});update();rgs.forEach(x=>x.querySelector('.rail-main').addEventListener('click',e=>{if(matchMedia('(max-width:900px)').matches)return;e.preventDefault();const wasOpen=shown(x);x.classList.toggle('open',!wasOpen);x.classList.toggle('closed',wasOpen);sync()}));sync();(function(){/* AY 도해 등장 애니메이션 — 본편 전용. 부록 페이지는 탭이 display:none 이라 관찰이 안 되므로 적용하지 않는다 */
if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
document.documentElement.classList.add('is-anim');
const SEL='.visual,.rewrite,.swap,.bookmark-grid,.badge-list';
const STAG='.axis-legend>div,.layer-rows>div,.sequence>div,.carousel>div,.flow5-col,.engine-matrix-row,.pillars>div,.translate-rows>div,.acts3-bar,.allow-deny>div,.allow-deny>strong,.experiment>div,.mirror-row,.hbar,.film-card,.gal-card,.bookmark,.rw-side,.swap-list>li,.badge-list>li,.translate-q,.translate-foot';
const FILL='.hbar i em,.mirror-row i,.engine-track i';
const figs=[...document.querySelectorAll(SEL)];
figs.forEach(f=>{
 [...f.querySelectorAll(STAG)].forEach((el,i)=>{el.classList.add('an-item');el.style.setProperty('--i',i)});
 [...f.querySelectorAll(FILL)].forEach((el,i)=>{el.classList.add('an-fill');el.style.setProperty('--i',i)});
 [...f.querySelectorAll('.hbar>span,.total b')].forEach((el,i)=>{el.classList.add('an-num');el.style.setProperty('--i',i)});
 const tr=f.querySelector('.stacked-bar-track');if(tr)tr.classList.add('an-wipe');
});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}}),{threshold:.16,rootMargin:'0px 0px -6% 0px'});
figs.forEach(f=>io.observe(f));})();
document.addEventListener('click',e=>{const t=e.target.closest('.has-tip');document.querySelectorAll('.has-tip.open').forEach(o=>{if(o!==t)o.classList.remove('open')});if(t&&matchMedia('(hover:none)').matches)t.classList.toggle('open')});document.querySelectorAll('.ref-trigger,.cref').forEach(a=>a.addEventListener('click',e=>{if(matchMedia('(hover:none)').matches&&!a.classList.contains('open')){e.preventDefault();document.querySelectorAll('.cref.open,.ref-trigger.open').forEach(o=>o.classList.remove('open'));a.classList.add('open')}}));
/* CB. 상호 참조 이동 안내 툴팁 — 공유 요소 하나를 뷰포트 좌표로 놓는다(경계에서 잘리지 않게 보정).
   터치(hover:none)에서는 첫 탭에 툴팁, 두 번째 탭에 이동. */
(function(){var t=document.createElement('div');t.id='xref-tip';document.body.appendChild(t);var cur=null;
function show(a){var g=a.getAttribute('data-goto');if(!g)return;t.textContent=g;t.classList.add('on');
 var r=a.getBoundingClientRect(),w=t.offsetWidth,h=t.offsetHeight,x=r.left,y=r.top-h-8;
 if(x+w>innerWidth-14)x=innerWidth-14-w;if(x<14)x=14;if(y<8)y=r.bottom+8;
 t.style.left=x+'px';t.style.top=y+'px';cur=a}
function hide(){t.classList.remove('on');cur=null}
[].forEach.call(document.querySelectorAll('a.xref[data-goto]'),function(a){
 a.addEventListener('mouseenter',function(){show(a)});a.addEventListener('mouseleave',hide);
 a.addEventListener('focus',function(){show(a)});a.addEventListener('blur',hide);
 a.addEventListener('click',function(e){if(matchMedia('(hover:none)').matches&&cur!==a){e.preventDefault();show(a)}})});
addEventListener('scroll',hide,{passive:true});
document.addEventListener('click',function(e){var n=e.target&&e.target.closest?e.target.closest('a.xref[data-goto]'):null;if(!n)hide()},true);
})();</script>${MARK?fs.readFileSync(__dirname+'/mark_tool.html','utf8'):''}<!-- refeeel-doc-view-beacon --><script>(function(){try{
var K='rf_v',v=localStorage.getItem(K);
if(!v){v=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem(K,v);}
var d=location.pathname.replace(/index\\.html$/,'').replace(/^\\/+|\\/+$/g,'');
if(!d)return;
var kind=d.indexOf('brand_guide')===0?(/guideline/.test(d)?'guideline':'proposal'):'report';
var t0=Date.now(),sent=false;
function send(ms){var b=JSON.stringify({doc:d,v:v,kind:kind,ms:ms});
if(navigator.sendBeacon&&navigator.sendBeacon('https://refeeel-ig.naktaaa00.workers.dev/doc-view',new Blob([b],{type:'text/plain;charset=UTF-8'})))return;
fetch('https://refeeel-ig.naktaaa00.workers.dev/doc-view',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:b,keepalive:true}).catch(function(){});}
send(null);
addEventListener('pagehide',function(){if(sent)return;sent=true;send(Date.now()-t0);});
}catch(e){}})();</script></body></html>`;
fs.writeFileSync(dest,html);console.log(dest);
// ── marks 존재 검증 (--mark 여부와 무관하게 항상 실행, 콘솔 보고용) ──
const srcText=lines.join('\n');
const missing=marks.filter(m=>!srcText.includes(m));
if(missing.length){console.log('\n[marks 미검증 — v3 원문에 없음, 배열은 유지]');missing.forEach(m=>console.log('  · '+m));}
else console.log('\n[marks] 전건 v3 원문에서 확인됨.');
// 형광펜 렌더 결과 대조 — 배열 항목이 실제로 marker 스팬으로 몇 번 찍혔는지
marks.forEach(m=>{const e=esc(m),n=(html.match(new RegExp('<span class="marker">'+e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
 if(!n)console.log('  ! marker 미출력: '+m.slice(0,30)+'…'); else if(n>1)console.log(`  · marker ${n}회 출력: ${m.slice(0,28)}…`)});
// ── 부록 페이지는 **읽기 전용**으로만 연다. 여기서 write 하는 코드를 다시 만들지 말 것 ──
// 링크 검증의 기준은 MD 부록 원문이 아니라 실제 부록 파일의 id 다. 손으로 고친 앵커가
// 정본이므로, 본편 MD 의 딥링크를 그 id 에 맞추는 방향으로 고친다(반대 방향 금지).
let apRaw='';try{apRaw=fs.readFileSync(__dirname+'/'+APPENDIX_PAGE,'utf8')}catch(e){console.warn('[부록] 파일을 찾지 못해 링크 검증을 건너뜀')}
const apBody=apRaw.replace(/<script[\s\S]*?<\/script>/g,'');
// 상호 참조 링크 — 대상 앵커 실재 확인
const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
const apIds=new Set([...apBody.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
const hrefs=[...html.matchAll(/<a class="xref" href="#([^"]+)"/g)].map(m=>m[1]);
const extHrefs=[...html.matchAll(/<a class="xref xref-ext" href="cp10_appendix_read\.html#([^"]+)"/g)].map(m=>m[1]);
const broken=[...new Set(hrefs.filter(h=>!ids.has(h)))].concat([...new Set(extHrefs.filter(h=>!apIds.has(h)))].map(h=>'(부록)'+h));
console.log(`[부록 딥링크] 본편→부록 ${extHrefs.length}건 · 부록 앵커 ${apIds.size}개 · 깨진 딥링크 ${extHrefs.filter(h=>!apIds.has(h)).length}건`);
// 부록 쪽 링크도 대조 — 부록 내부 로컬 앵커는 부록 id, xref-ext는 본편 id 로 풀려야 한다
const apHtml=apBody;
const apLocal=[...apHtml.matchAll(/<a class="xref" href="#([^"]+)"/g)].map(m=>m[1]);
const apExt=[...apHtml.matchAll(/<a class="xref xref-ext" href="cp10_full_report\.html#([^"]+)"/g)].map(m=>m[1]);
const apBroken=[...new Set(apLocal.filter(h=>!apIds.has(h)))].concat([...new Set(apExt.filter(h=>!ids.has(h)))].map(h=>'(본편)'+h));
console.log(`[부록 페이지 링크] 내부 ${apLocal.length}건 · 본편 역참조 ${apExt.length}건 · 깨진 참조 ${apBroken.length}건${apBroken.length?' — '+apBroken.join(', '):''}`);
// 본편 분량 실측
const plain=html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<template[\s\S]*?<\/template>/g,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
const apPlain=apHtml.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<template[\s\S]*?<\/template>/g,'').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
console.log(`[분량] 본편 본문 ${plain.length.toLocaleString()}자 · 부록 페이지 ${apPlain.length.toLocaleString()}자 · 부록 비중 ${(apPlain.length/(plain.length+apPlain.length)*100).toFixed(1)}%`);
console.log(`[xref] 상호 참조 링크 ${hrefs.length}건 · 깨진 참조 ${broken.length}건${broken.length?' — '+broken.join(', '):''}`);
// ── CB. 이동 안내 툴팁 — xrefA가 만든 링크 전건에 '→ 번호. 제목'이 붙었는지 ──
{
 const tipOf=s=>{const all=[...s.matchAll(/<a class="xref(?: xref-ext)?" href="[^"]*"([^>]*)>/g)];
  return [all.length,all.filter(m=>/ data-goto="/.test(m[1])).length]};
 const [nA,nAt]=tipOf(html),[nB,nBt]=tipOf(apRaw);
 const miss=(nA-nAt)+(nB-nBt);
 console.log(`[이동 툴팁] 본편 ${nAt}/${nA}건 · 부록 ${nBt}/${nB}건 · 제목 추출 실패 ${miss}건${tipMiss.length?' — '+[...new Set(tipMiss)].join(', '):''}`);
}
// ── CD. 이탤릭 전면 금지 · 구 별책(evidence.html) 참조 폐기 상시 검사 ──
{
 const srcs=[['cp10_full_style.css',css],['cp10_full_report.html',html],['cp10_appendix_read.html',apRaw],['CP10 MD 정본',lines.join('\n')]];
 const ital=srcs.filter(([n,t])=>/font-style\s*:\s*(italic|oblique)/i.test(t)).map(([n])=>n);
 const ev=srcs.filter(([n,t])=>/evidence\.html/.test(t)).map(([n])=>n);
 console.log(`[이탤릭] font-style 기울임 ${ital.length}건${ital.length?' — '+ital.join(', '):' (전 소스 정체)'} · [구 별책 참조] ${ev.length}건${ev.length?' — '+ev.join(', '):''}`);
}
// ── CC. 레일 라벨 잘림 검사 — 잘림 유발 속성 0건 + 라벨 전문이 고정폭 안에서 감싸지는지 ──
{
 const cut=(s,head)=>{ // @media(head){…} 블록을 통째로 들어낸다(중괄호 짝 맞춰서)
  let i;while((i=s.indexOf(head))>=0){let d=0,j=s.indexOf('{',i);let k=j;
   for(;k<s.length;k++){if(s[k]==='{')d++;else if(s[k]==='}'&&--d===0)break}
   s=s.slice(0,i)+s.slice(k+1)}
  return s};
 const deskCss=cut(css,'@media(max-width:900px)');
 const badProp=[...deskCss.matchAll(/(\.rail[a-z-]*(?:\s*[>,][^{]*)?[^{}]*)\{([^}]*)\}/g)]
  .filter(m=>/white-space:\s*nowrap|text-overflow:\s*ellipsis|-webkit-line-clamp/.test(m[2]))
  .map(m=>m[1].trim());
 const railW=+(css.match(/--rail:(\d+)px/)||[0,0])[1];
 const colMain=railW-72,colSub=railW-51;   // 점(7)+간격(9)+번호(47/19)+간격(9/7)+들여쓰기(25)
 const w=(s,fs)=>[...s].reduce((a,c)=>a+(/[가-힣]/.test(c)?1:/\s/.test(c)?.34:/[A-Za-z0-9]/.test(c)?.56:.52),0)*fs;
 const labelsOf=src=>{const m=src.match(/<nav class="rail">([\s\S]*?)<\/nav>/);if(!m)return[];
  const out=[];
  [...m[1].matchAll(/<a class="rail-main[^"]*"[^>]*>[\s\S]*?<b>([^<]*)<\/b>/g)].forEach(x=>out.push(['파트',x[1],colMain,11.5]));
  [...m[1].matchAll(/<div class="rail-sub">([\s\S]*?)<\/div>/g)].forEach(g=>
   [...g[1].matchAll(/<b>([^<]*)<\/b>/g)].forEach(x=>out.push(['절',x[1],colSub,11])));
  return out};
 const rows=[...labelsOf(html),...labelsOf(apRaw)];
 const over=rows.filter(r=>r[1].split(/\s+/).some(t=>w(t,r[3])>r[2]));
 const maxL=rows.reduce((a,r)=>Math.max(a,Math.ceil(w(r[1],r[3])/r[2])),0);
 console.log(`[레일] 라벨 ${rows.length}개 · 잘림 유발 속성 ${badProp.length}건${badProp.length?' — '+badProp.join(' / '):''} · 폭 초과 어절 ${over.length}건${over.length?' — '+over.map(r=>r[1]).join(', '):''} · 최대 감김 ${maxL}줄 (라벨 칸 파트 ${colMain}px · 절 ${colSub}px)`);
}
// 장별 형광펜 개수
const partTitles={};lines.forEach(l=>{const m=l.match(/^#\s+(.+)$/);if(m)partTitles[m[1]]=1});
const tally=[];let cur='(문서 앞)';
html.split(/(<section class="chapter"[^>]*>|<span class="marker">)/).forEach(seg=>{
 const sm=seg.match(/^<section class="chapter" id="([^"]+)"/);
 if(sm){cur=sm[1];tally.push([cur,0]);return}
 if(seg==='<span class="marker">'){if(!tally.length)tally.push([cur,0]);tally[tally.length-1][1]++}
});
const nz=tally.filter(x=>x[1]>0);
console.log(`[형광펜] 총 ${nz.reduce((a,b)=>a+b[1],0)}개 — `+nz.map(x=>`${x[0]}:${x[1]}`).join(' · '));
if(movedAside.length){console.log(`[우측 트랙 이동] 도해 해설 ${movedAside.length}건`);movedAside.forEach(t=>console.log('  · '+t))}
const bmTotal=(html.match(/class="bookmark"/g)||[]).length;
console.log(`[북마크 카드] ${bmTotal}장${bmMissing.length?` · 썸네일 없음 ${bmMissing.length}건(플레이스홀더): ${[...new Set(bmMissing)].join(', ')}`:' · 썸네일 전건 캐시됨'}`);
const dupNum=[...html.matchAll(/<div class="section-no">([^<]*)<\/div>/g)].filter(m=>/^(\d+|부록\s*[A-Za-z])\s—\s\1/.test(m[1].replace(/\s+/g,' ')));
console.log(`[번호 중복] section-no 중복 표기 ${dupNum.length}건`);
const lbRe=/<p class="[^"]*label-bullet[^"]*"/g;
console.log(`[라벨 불릿] ${labelBullets}건 (본편 ${(html.match(lbRe)||[]).length} · 부록 ${(apBody.match(lbRe)||[]).length})`);
// ↗ 잔존 상시 검사 — 본문 흐름(margin-note·visual-aside·카드 밖)에 남은 포인터가 있으면 실패로 본다
const strayScan=src=>{
 const stripped=src.replace(/<span class="margin-note[\s\S]*?<\/span>/g,'')
  .replace(/<div class="visual-aside">[\s\S]*?<!--ASIDE-->/g,'')
  .replace(/<a class="bookmark"[\s\S]*?<\/a>/g,'')
  .replace(/<template[\s\S]*?<\/template>/g,'')
  .replace(/<figcaption[\s\S]*?<\/figcaption>/g,'');
 return (stripped.match(/<p class="doc-link">/g)||[]).length;
};
const strayMain=strayScan(html),strayAp=strayScan(apBody);
console.log(`[↗ 잔존] 본문 ${strayMain}건 · 부록 ${strayAp}건${strayPtr.length?' · 붙일 곳 못 찾음 '+strayPtr.length+'건: '+strayPtr.join(' / '):''}`);
// 재언급 트리거(rw-ref·ref-trigger·"사례 보기")는 우측 트랙 밖에 남으면 안 된다 — 도해·개작 블록 내부까지 검사
const refScan=src=>{
 const stripped=src.replace(/<div class="visual-aside">[\s\S]*?<!--ASIDE-->/g,'')
  .replace(/<span class="margin-note[\s\S]*?<\/span>/g,'')
  .replace(/<template[\s\S]*?<\/template>/g,'');
 return (stripped.match(/class="(rw-ref|ref-trigger)"|사례 보기/g)||[]).length;
};
console.log(`[재언급 트리거 잔존] 본문 ${refScan(html)}건 · 부록 ${refScan(apBody)}건`);
const igLinks=[...html.matchAll(/<a class="xref ig-mention" href="https:\/\/www\.instagram\.com\/([^\/]+)\/"[^>]*>([^<]+)<\/a>/g)];
const igBad=igLinks.filter(m=>('@'+m[1])!==m[2]);
console.log(`[브랜드명 링크] ${brandCount}건 (절마다 첫 등장 1회)`);
console.log(`[@멘션] ${igLinks.length}건 · 오링크 ${igBad.length}건${igBad.length?' — '+igBad.map(m=>m[2]+'→'+m[1]).join(', '):''}`);
// ── 팔레트 화이트리스트 감시 (낙타 확정 260810) ──────────────────
// 허용: 기본 4색 + 차콜 파생 쿨그레이 + Signal Blue 램프 + Cloud Mist 파생/알파 + 형광펜 예외 2값
const PALETTE=new Set(['#ffffff','#13171b','#0030cf','#d7e1ec','#3a414a','#6b737e','#4762d6','#93a7e8','#edf2f7']);
const ALPHA_OK=[/^rgba?\(255,\s*255,\s*255[,)]/,/^rgba?\(19,\s*23,\s*27[,)]/,/^rgba?\(215,\s*225,\s*236[,)]/];
function paletteScan(src,label,out){
 const found=new Set();
 (src.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([\d.,\s%]*\)|hsla?\([^)]*\)/g)||[]).forEach(raw=>{
  let v=raw.toLowerCase();
  if(v.startsWith('#')){
   if(v.length===4)v='#'+v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
   if(v.length===9)v=v.slice(0,7);           // 8자리는 알파 — 색상부만 본다
   if(!PALETTE.has(v))found.add(raw);
  }else if(v.startsWith('rgb')){
   if(!ALPHA_OK.some(r=>r.test(v)))found.add(raw);
  }else found.add(raw);
 });
 if(found.size)out.push(`  · ${label}: ${[...found].join(', ')}`);
}
{
 const viol=[];
 paletteScan(css,'cp10_full_style.css',viol);
 paletteScan(fs.readFileSync(__dirname+'/render_cp10_full.js','utf8').replace(/PALETTE=new Set\([\s\S]*?\);/,''),'render_cp10_full.js',viol);
 paletteScan(html,'cp10_full_report.html',viol);
 try{paletteScan(fs.readFileSync(__dirname+'/'+APPENDIX_PAGE,'utf8'),'cp10_appendix_read.html',viol)}catch(e){}
 try{paletteScan(fs.readFileSync(__dirname+'/mark_tool.html','utf8'),'mark_tool.html',viol)}catch(e){}
 console.log(viol.length?`[팔레트 위반] ${viol.length}개 소스\n`+viol.join('\n'):'[팔레트] 전 소스 화이트리스트 준수 · 위반 0건');
}
