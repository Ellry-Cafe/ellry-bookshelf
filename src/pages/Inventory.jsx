import BookListWithFilter from '../components/BookListWithFilter'

export default function Inventory() {

  return (
    <main className="flex-1 p-4 bg-creamwhite">        
        <h2 className="text-lg font-semibold text-coffeebrown mb-2">Inventory</h2>  
        <BookListWithFilter layout="table" />    
    </main>
  )
}
