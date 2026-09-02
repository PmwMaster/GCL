import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrxdtyjwfhbaxdnrtmjs.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeGR0eWp3ZmhiYXhkbnJ0bWpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMzNjgwNSwiZXhwIjoyMTAzOTEyODA1fQ.ijUTTux94sx6GdQyIwU0KlK6Zt1J56EMMFPi_LGE5Hw'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const socios = [
  { email: 'Lucastutti101@gmail.com', nome: 'Lucas Tutti', area: 'dev' },
  { email: 'xaviernitrov@gmail.com', nome: 'Cristiano', area: 'dev' },
]

const SENHA_PADRAO = 'Gcl@2026!'

async function main() {
  for (const socio of socios) {
    console.log(`\nCriando usuario: ${socio.nome} (${socio.email})...`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: socio.email,
      password: SENHA_PADRAO,
      email_confirm: true,
      user_metadata: { nome: socio.nome },
    })

    if (error) {
      console.error(`  Erro ao criar: ${error.message}`)
      continue
    }

    const userId = data.user?.id
    if (!userId) {
      console.error('  Usuario criado mas sem ID retornado')
      continue
    }

    console.log(`  ID: ${userId}`)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ papel: 'socio', nome: socio.nome, area_principal: socio.area })
      .eq('id', userId)

    if (profileError) {
      console.error(`  Erro ao atualizar profile: ${profileError.message}`)
    } else {
      console.log(`  Profile atualizado: papel=socio, area=${socio.area}`)
    }
  }

  console.log('\n--- Concluido ---')
  console.log(`Senha padrao: ${SENHA_PADRAO}`)
  console.log('Os socios podem alterar a senha apos o primeiro login.')
}

main()
