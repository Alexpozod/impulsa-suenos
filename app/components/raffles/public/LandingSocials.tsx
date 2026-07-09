export default function LandingSocials({
  instagram,
  facebook,
  tiktok,
  youtube
}:{
  instagram?:string
  facebook?:string
  tiktok?:string
  youtube?:string
}){

  return(

    <div className="mt-10 flex justify-center gap-5 flex-wrap">

      {instagram && (

        <a
          href={instagram}
          target="_blank"
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 transition"
        >
          📷 Instagram
        </a>

      )}

      {facebook && (

        <a
          href={facebook}
          target="_blank"
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 transition"
        >
          👍 Facebook
        </a>

      )}

      {tiktok && (

        <a
          href={tiktok}
          target="_blank"
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 transition"
        >
          🎵 TikTok
        </a>

      )}

      {youtube && (

        <a
          href={youtube}
          target="_blank"
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400 transition"
        >
          ▶ YouTube
        </a>

      )}

    </div>

  )

}