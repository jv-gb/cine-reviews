export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  duration: number;
  genre: string[];
  director: string;
  officialSummary: string;
  poster: string;
  averageRating: number;
  userReviews: Review[];
  streamingPlatforms: string[];
}

export const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Interestelar',
    year: 2014,
    duration: 169,
    genre: ['Ficção Científica', 'Drama', 'Aventura'],
    director: 'Christopher Nolan',
    officialSummary: 'Um grupo de astronautas viaja através de um buraco de minhoca em busca de um novo lar para a humanidade, enquanto na Terra, o tempo está se esgotando para a sobrevivência da espécie.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    averageRating: 4.8,
    userReviews: [
      {
        id: 'r1',
        userName: 'Ana Silva',
        rating: 5,
        comment: 'Filme incrível! Os efeitos visuais são de tirar o fôlego e a história é emocionante.',
        date: '2024-01-15'
      },
      {
        id: 'r2',
        userName: 'Carlos Santos',
        rating: 4,
        comment: 'Muito bom, mas um pouco longo. A parte científica é fascinante.',
        date: '2024-02-20'
      }
    ],
    streamingPlatforms: ['Netflix', 'Prime Video']
  },
  {
    id: '2',
    title: 'Parasita',
    year: 2019,
    duration: 132,
    genre: ['Drama', 'Thriller', 'Comédia'],
    director: 'Bong Joon-ho',
    officialSummary: 'Uma família pobre se infiltra na casa de uma família rica, levando a consequências inesperadas e uma crítica social afiada.',
    poster: 'https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=400&h=600&fit=crop',
    averageRating: 4.7,
    userReviews: [
      {
        id: 'r3',
        userName: 'Mariana Lima',
        rating: 5,
        comment: 'Obra-prima! A crítica social é brilhante e o roteiro é impecável.',
        date: '2024-03-10'
      }
    ],
    streamingPlatforms: ['Netflix']
  },
  {
    id: '3',
    title: 'O Poderoso Chefão',
    year: 1972,
    duration: 175,
    genre: ['Crime', 'Drama'],
    director: 'Francis Ford Coppola',
    officialSummary: 'A história da família mafiosa Corleone sob o patriarca Vito Corleone e seu filho Michael.',
    poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop',
    averageRating: 4.9,
    userReviews: [
      {
        id: 'r4',
        userName: 'Roberto Alves',
        rating: 5,
        comment: 'Clássico absoluto. Marlon Brando está fenomenal.',
        date: '2024-01-30'
      },
      {
        id: 'r5',
        userName: 'Fernanda Costa',
        rating: 5,
        comment: 'Cinema em sua forma mais pura. Imperdível!',
        date: '2024-02-15'
      }
    ],
    streamingPlatforms: ['Prime Video', 'Paramount+']
  },
  {
    id: '4',
    title: 'Clube da Luta',
    year: 1999,
    duration: 139,
    genre: ['Drama', 'Thriller'],
    director: 'David Fincher',
    officialSummary: 'Um homem desiludido forma um clube de luta secreto como terapia alternativa, levando a algo muito maior.',
    poster: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=600&fit=crop',
    averageRating: 4.6,
    userReviews: [
      {
        id: 'r6',
        userName: 'Lucas Mendes',
        rating: 5,
        comment: 'Revolucionário. A primeira regra é não falar sobre o Clube da Luta.',
        date: '2024-03-05'
      }
    ],
    streamingPlatforms: ['Netflix', 'Star+']
  },
  {
    id: '5',
    title: 'A Origem',
    year: 2010,
    duration: 148,
    genre: ['Ficção Científica', 'Ação', 'Thriller'],
    director: 'Christopher Nolan',
    officialSummary: 'Um ladrão que rouba segredos corporativos usando tecnologia de compartilhamento de sonhos recebe a tarefa inversa de implantar uma ideia na mente de um CEO.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
    averageRating: 4.7,
    userReviews: [
      {
        id: 'r7',
        userName: 'Pedro Oliveira',
        rating: 5,
        comment: 'Mente explodindo a cada cena. Nolan é gênio!',
        date: '2024-02-28'
      }
    ],
    streamingPlatforms: ['Netflix', 'HBO Max']
  },
  {
    id: '6',
    title: 'Pulp Fiction: Tempo de Violência',
    year: 1994,
    duration: 154,
    genre: ['Crime', 'Drama'],
    director: 'Quentin Tarantino',
    officialSummary: 'As vidas de dois assassinos da máfia, um boxeador, um gângster e sua esposa se entrelaçam em quatro histórias de violência e redenção.',
    poster: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=600&fit=crop',
    averageRating: 4.8,
    userReviews: [
      {
        id: 'r8',
        userName: 'Sofia Ramos',
        rating: 5,
        comment: 'Tarantino no seu melhor. Diálogos memoráveis!',
        date: '2024-03-12'
      }
    ],
    streamingPlatforms: ['Netflix', 'Prime Video']
  }
];