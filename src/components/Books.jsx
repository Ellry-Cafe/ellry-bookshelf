import BookListWithFilter from './BookListWithFilter';

export default function Books() {
  return (
        <main className="flex-1 p-4 bg-creamwhite">      
          <h2 className="text-lg font-semibold text-coffeebrown mb-2">Books</h2>  
          <BookListWithFilter layout="grid" />                    
        </main>
    );
}