"use client"

import { useEffect } from "react"

export default function AffiliateTracker() {

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            )

        const aff =
            params.get("aff")

        if (!aff) return

        try {

            localStorage.setItem(
                "raffle_affiliate",
                aff
            )

            sessionStorage.setItem(
                "raffle_affiliate",
                aff
            )

        } catch (e) {

            console.error(e)

        }

    }, [])

    return null

}