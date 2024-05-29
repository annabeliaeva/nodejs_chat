interface Item {
    id: string;
    title: string;
    synonyms: string[];
    characteristics?: { [key: string]: any };
}

interface Category {
    id: string;
    title: string;
    name: string;
    synonyms: string[];
    items?: Item[];
    subcategories?: Category[];
}

interface Game {
    id: string;
    title: string;
    shortTitle: string;
    synonyms: string[];
    categories: Category[];
}

export interface Marketplace {
    games: Game[];
}

export type SearchResult = {
    gameTitle: string;
    gameShortTitle: string;
    gameLink: string;
    matchedCategories: {
        categoryTitle: string;
        categoryName: string;
        categoryLink: string;
        matchedSynonyms: string[];
    }[];
    breadcrumbs: string[];
    matchedSynonyms: string[];
    allCategories: {
        categoryTitle: string;
        categoryName: string;
        categoryLink: string;
    }[];
};

// Функция для вычисления расстояния Левенштейна
const levenshtein = (a: string, b: string): number => {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

// Функция для трансформации раскладок клавиатуры
const transliterate = (text: string): string => {
    const mapping = {
        // Пример маппинга символов раскладок (англ -> рус)
        'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
        'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д',
        'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь'
        // Добавить остальные символы
    };
    return text.split('').map(char => mapping[char] || char).join('');
};

// Улучшенная функция для поиска синонимов с учетом опечаток, частичных совпадений и транслитерации
const findSynonyms = (synonyms: string[], queryWords: string[]): string[] => {
    const matchedSynonyms = new Set<string>();
    const threshold = (str: string) => str.length / 2.5;

    const generateTrigrams = (str: string): string[] => {
        const trigrams = [];
        for (let i = 0; i < str.length - 2; i++) {
            trigrams.push(str.slice(i, i + 3));
        }
        return trigrams;
    };

    for (const queryWord of queryWords) {
        const lowerCaseQueryWord = queryWord.toLowerCase();
        const transliteratedQueryWord = transliterate(lowerCaseQueryWord);
        const queryTrigrams = generateTrigrams(lowerCaseQueryWord);
        for (const synonym of synonyms) {
            const lowerCaseSynonym = synonym.toLowerCase();
            const transliteratedSynonym = transliterate(lowerCaseSynonym);
            const synonymTrigrams = generateTrigrams(lowerCaseSynonym);
            const commonTrigrams = queryTrigrams.filter(trigram => synonymTrigrams.includes(trigram));
            const distance = levenshtein(lowerCaseSynonym, lowerCaseQueryWord);
            const transliteratedDistance = levenshtein(transliteratedSynonym, transliteratedQueryWord);

            if (
                lowerCaseSynonym.includes(lowerCaseQueryWord) ||
                lowerCaseQueryWord.includes(lowerCaseSynonym) ||
                distance <= threshold(lowerCaseSynonym) ||
                transliteratedDistance <= threshold(transliteratedSynonym)
            ) {
                matchedSynonyms.add(synonym);
                console.log('distance ', distance)
                console.log('synonym ', synonym)
                console.log('lowerCaseQueryWord ', lowerCaseQueryWord)
            }
        }
    }

    return Array.from(matchedSynonyms);
};

const parseQuery = (query: string): string[] => query.toLowerCase().split(/\s+/);

// Поиск подходящих игр по запросу
const searchGamesByQuery = (marketplace: Marketplace, queryWords: string[]): Game[] => {
    return marketplace.games.filter(game => findSynonyms(game.synonyms, queryWords).length > 0);
};

const getAllCategories = (categories: Category[], breadcrumbs: string[]): { categoryTitle: string; categoryName: string; categoryLink: string; }[] => {
    let allCategories = [];
    for (const category of categories) {
        const newBreadcrumbs = [...breadcrumbs, category.title];
        allCategories.push({
            categoryTitle: category.title,
            categoryName: category.name,
            categoryLink: `/${newBreadcrumbs.join('/')}`
        });
        if (category.subcategories && category.subcategories.length > 0) {
            allCategories = allCategories.concat(getAllCategories(category.subcategories, newBreadcrumbs));
        }
    }
    return allCategories;
};

// Обновленный алгоритм поиска категорий внутри найденных игр
const searchInCategories = (categories: Category[], queryWords: string[], breadcrumbs: string[], matchedSynonyms: string[]): any[] => {
    const results = [];

    for (const category of categories) {
        const categoryMatchedSynonyms = findSynonyms(category.synonyms, queryWords);
        if (categoryMatchedSynonyms.length > 0) {
            const newBreadcrumbs = [...breadcrumbs, category.title];
            results.push({
                categoryTitle: category.title,
                categoryName: category.name,
                categoryLink: `/${newBreadcrumbs.join('/')}`,
                matchedSynonyms: categoryMatchedSynonyms
            });
            matchedSynonyms.push(...categoryMatchedSynonyms);
        }

        if (category.subcategories && category.subcategories.length > 0) {
            const subcategoryResults = searchInCategories(category.subcategories, queryWords, [...breadcrumbs, category.title], matchedSynonyms);
            if (subcategoryResults.length > 0) {
                results.push(...subcategoryResults.filter(result => result.matchedSynonyms.length > 0));
            }
        }
    }

    return results;
};

export const searchGames = (marketplace: Marketplace, query: string): SearchResult[] => {
    const queryWords = parseQuery(query);
    const results: SearchResult[] = [];

    // Поиск подходящих игр по запросу
    const matchedGames = searchGamesByQuery(marketplace, queryWords);
    console.log(`Найденные игры: ${matchedGames.map(game => game.title)}`);

    for (const game of matchedGames) {
        const gameMatchedSynonyms = findSynonyms(game.synonyms, queryWords);
        const matchedCategories = searchInCategories(game.categories, queryWords, [game.shortTitle], []);
        console.log('matchedCategories ', matchedCategories);
        const allCategories = getAllCategories(game.categories, [game.shortTitle]);

        results.push({
            gameTitle: game.title,
            gameShortTitle: game.shortTitle,
            gameLink: `/${game.shortTitle}`,
            matchedCategories: matchedCategories.length > 0 ? matchedCategories : null,
            breadcrumbs: [game.title],
            matchedSynonyms: gameMatchedSynonyms,
            allCategories: allCategories
        });
    }

    return results;
};
