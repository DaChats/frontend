export default function App() {
  const nev: string = 'Szia'

  return (
    <main className="w-full flex flex-col justify-center items-center gap-10 h-screen">
      <><h1 className="text-3xl font-bold underline text-sky-400">
        Hello <span className="text-red-400 underline">{nev}</span>
      </h1>
        <br />
        <a href="/login" className="flex gap-2 items-center justify-center p-3 px-6 rounded-full bg-gradient-to-r text-white from-[#5A230C] to-[#755547]">
          Login
        </a></>
    </main>
  )
}