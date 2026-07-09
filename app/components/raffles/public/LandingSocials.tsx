import {

  Instagram,

  Facebook,

  Youtube

} from "lucide-react"

function TikTokIcon({

  className="w-5 h-5"

}:{

  className?:string

}){

  return(

    <svg

      xmlns="http://www.w3.org/2000/svg"

      viewBox="0 0 24 24"

      fill="currentColor"

      className={className}

    >

      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.68h-3.12v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .58.05.84.13V9.36a6.02 6.02 0 1 0 6.18 6v-6.8a7.9 7.9 0 0 0 4.77 1.6V7.08c-.69 0-1.37-.14-2-.39z"/>

    </svg>

  )

}

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

    <div

      className="

        mt-10

        flex

        flex-wrap

        justify-center

        gap-4

      "

    >

      {instagram && (

        <a

          href={instagram}

          target="_blank"

          rel="noopener noreferrer"

          className="

            flex

            items-center

            gap-2

            px-5

            py-3

            rounded-xl

            bg-slate-900

            border

            border-slate-800

            hover:border-pink-500

            hover:text-pink-400

            transition-all

          "

        >

          <Instagram size={20} />

          <span>

            Instagram

          </span>

        </a>

      )}

      {facebook && (

        <a

          href={facebook}

          target="_blank"

          rel="noopener noreferrer"

          className="

            flex

            items-center

            gap-2

            px-5

            py-3

            rounded-xl

            bg-slate-900

            border

            border-slate-800

            hover:border-blue-500

            hover:text-blue-400

            transition-all

          "

        >

          <Facebook size={20} />

          <span>

            Facebook

          </span>

        </a>

      )}

      {tiktok && (

        <a

          href={tiktok}

          target="_blank"

          rel="noopener noreferrer"

          className="

            flex

            items-center

            gap-2

            px-5

            py-3

            rounded-xl

            bg-slate-900

            border

            border-slate-800

            hover:border-cyan-400

            hover:text-cyan-300

            transition-all

          "

        >

          <TikTokIcon />

          <span>

            TikTok

          </span>

        </a>

      )}

      {youtube && (

        <a

          href={youtube}

          target="_blank"

          rel="noopener noreferrer"

          className="

            flex

            items-center

            gap-2

            px-5

            py-3

            rounded-xl

            bg-slate-900

            border

            border-slate-800

            hover:border-red-500

            hover:text-red-400

            transition-all

          "

        >

          <Youtube size={20} />

          <span>

            YouTube

          </span>

        </a>

      )}

    </div>

  )

}