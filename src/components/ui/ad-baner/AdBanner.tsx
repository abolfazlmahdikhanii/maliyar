import { Avatar } from "@heroui/react";

const AdBanner = () => {
  return (
    <div className="relative w-full  rounded-[32px] bg-primary h-129 px-6 py-6.5 shadow-sm overflow-hidden flex flex-col">
      <div className="relative flex items-center justify-between">
        <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center text-black">
          <svg width={30} height={30} aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"></path>
          </svg>
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 rounded-full px-3.5 py-2 text-xs font-medium text-black/70">
          <span className="text-neutral-700">دستیار هوش مصنوعی</span>
          <svg width={14} height={14} viewBox="0 0 24 24">
            <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25z"></path>
          </svg>
        </div>
      </div>
      <div className="flex flex-col justify-between h-full ">
        <div className="relative  flex flex-col justify-center gap-3 flex-1">
          <h2 className="text-[32px] font-bold text-black leading-[1.35]">
            همین حالا با هوش مصنوعی جلو بیفت
          </h2>
          <p className="text-base text-black/70 leading-8">
            بگذار دستیار هوش مصنوعی ما تحلیل‌ها را برایت انجام دهد؛ تصمیم‌های
            بهتر، پیش‌بینی‌های دقیق‌تر و دیدی روشن از بازار، فقط با یک کلیک.
          </p>
          <div className="flex items-center gap-3 mb-5 mt-3.5">
            <div className="flex -space-x-2">
              <Avatar className="ring-2 ring-primary">
                <Avatar.Image
                  src={
                    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
                  }
                />
                <Avatar.Fallback>A</Avatar.Fallback>
              </Avatar>
              <Avatar className="ring-2 ring-primary">
                <Avatar.Image
                  src={
                    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg"
                  }
                />
                <Avatar.Fallback>A</Avatar.Fallback>
              </Avatar>
              <Avatar className="ring-2 ring-primary">
                <Avatar.Image
                  src={
                    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
                  }
                />
                <Avatar.Fallback>A</Avatar.Fallback>
              </Avatar>
            </div>
            <div className="text-xs text-black/70 leading-4">
              <div className="font-bold text-sm text-black mb-1">
                +۷.۸ هزار نفر
              </div>
              <div>روزانه به ما اعتماد می‌کنند</div>
            </div>
            <div className="mr-12 text-black/50">
              <svg
                width="75"
                height="95"
                viewBox="0 0 228 392"
                xmlns="http://www.w3.org/2000/svg"
                
              >
                <path
                  fillRule="evenodd"
                  fill="black"
                  d="M57,156 L56,162 L52,167 L41,168 L40,178 L32,181 L32,186 L28,189 L28,210 L20,213 L20,222 L28,225 L28,238 L32,241 L32,246 L38,247 L44,253 L45,259 L78,259 L81,251 L90,251 L93,247 L98,247 L99,237 L103,234 L103,217 L111,214 L111,189 L103,186 L103,169 L98,164 L93,164 L92,174 L100,177 L100,198 L104,201 L104,210 L100,213 L100,226 L92,229 L92,238 L88,241 L88,246 L86,248 L77,248 L74,252 L53,252 L50,248 L43,246 L43,241 L38,236 L31,234 L31,193 L38,191 L43,186 L43,177 L51,174 L52,167 L62,167 L65,163 L74,163 L77,155 L110,155 L113,163 L130,163 L136,169 L136,174 L142,175 L148,181 L148,186 L156,189 L156,198 L160,201 L160,210 L168,213 L168,250 L160,253 L160,270 L156,273 L156,286 L148,289 L148,302 L144,305 L144,314 L137,316 L134,320 L125,320 L119,314 L118,308 L112,309 L112,326 L120,329 L120,354 L134,355 L137,351 L146,351 L149,343 L158,343 L161,339 L167,338 L166,332 L157,332 L154,328 L145,328 L143,326 L143,321 L147,318 L147,309 L155,306 L155,297 L159,294 L159,277 L167,274 L167,261 L171,258 L171,205 L167,202 L167,193 L159,190 L159,181 L154,176 L149,176 L147,169 L142,164 L135,162 L134,156 L121,156 L118,152 L69,152 L66,156 Z M45,88 L44,98 L50,99 L52,106 L57,111 L64,113 L64,118 L68,121 L68,130 L74,131 L76,138 L81,143 L86,143 L87,133 L79,130 L79,125 L75,122 L75,113 L69,112 L63,106 L63,101 L57,100 L51,94 L50,88 Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <button className="w-full bg-black text-white rounded-full py-4 text-sm font-semibold hover:bg-black/85 transition-colors">
            فعال‌سازی قدرت هوش مصنوعی
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
