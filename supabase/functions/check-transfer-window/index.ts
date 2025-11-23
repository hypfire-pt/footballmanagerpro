import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TransferWindowRequest {
  saveId: string
  currentDate: string
}

interface TransferWindow {
  isOpen: boolean
  type: 'summer' | 'winter' | null
  startDate: string | null
  endDate: string | null
  daysRemaining: number | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { saveId, currentDate } = await req.json() as TransferWindowRequest
    
    const date = new Date(currentDate)
    const month = date.getMonth() // 0-11
    const year = date.getFullYear()
    
    let transferWindow: TransferWindow = {
      isOpen: false,
      type: null,
      startDate: null,
      endDate: null,
      daysRemaining: null
    }
    
    // Summer transfer window: June 1 - September 1
    if (month >= 5 && month <= 7) { // June (5), July (6), August (7)
      const summerStart = new Date(year, 5, 1) // June 1
      const summerEnd = new Date(year, 8, 1) // September 1
      
      if (date >= summerStart && date <= summerEnd) {
        const daysRemaining = Math.floor((summerEnd.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        
        transferWindow = {
          isOpen: true,
          type: 'summer',
          startDate: summerStart.toISOString().split('T')[0],
          endDate: summerEnd.toISOString().split('T')[0],
          daysRemaining
        }
      }
    }
    
    // Winter transfer window: January 1 - January 31
    if (month === 0) { // January
      const winterStart = new Date(year, 0, 1) // January 1
      const winterEnd = new Date(year, 0, 31) // January 31
      
      if (date >= winterStart && date <= winterEnd) {
        const daysRemaining = Math.floor((winterEnd.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        
        transferWindow = {
          isOpen: true,
          type: 'winter',
          startDate: winterStart.toISOString().split('T')[0],
          endDate: winterEnd.toISOString().split('T')[0],
          daysRemaining
        }
      }
    }
    
    console.log('Transfer window status:', transferWindow)
    
    return new Response(
      JSON.stringify({ transferWindow }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Transfer window check error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
