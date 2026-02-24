
import { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import css from './App.module.css'
import toast, { Toaster } from 'react-hot-toast';
import fetchMovies from '../../services/movieService';
import type { Movie } from '../../types/movie';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import ReactPaginate from 'react-paginate';
import { keepPreviousData, useQuery } from '@tanstack/react-query';


export default function App() {

  
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(1);

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  const { data, isLoading, isSuccess ,isError } = useQuery(
  {
    queryKey: ['movie', query,page],
      queryFn: () => fetchMovies(query,page),
      enabled: query !== '',
      placeholderData: keepPreviousData,
    });
  
  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (data?.results.length === 0) {
      toast('No movies found for your request.');
    }
  }, [data?.results]);

  const handleForm = (title: string) => {
    console.log("Movie:", title);
    setQuery(title);  
    setPage(1);
  }
  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleForm}></SearchBar>
      {totalPages > 1 &&
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      }
      
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {isSuccess && data.results.length > 0 && <MovieGrid movies={data.results} onSelect={openModal} />}
      
      {isModalOpen && <MovieModal movie={selectedMovie} onClose={closeModal} />}
      <Toaster />
    </div>
    
    
  );
}
