import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
    items: T[];
    itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
    currentPage: number;
    totalPages: number;
    paginatedItems: T[];
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    setItemsPerPage: (size: number) => void;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    totalItems: number;
}

export function usePagination<T>({ items, itemsPerPage: initialItemsPerPage = 10 }: UsePaginationProps<T>): UsePaginationReturn<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const previousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const setItemsPerPage = (size: number) => {
        setItemsPerPageState(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    return {
        currentPage,
        totalPages,
        paginatedItems,
        goToPage,
        nextPage,
        previousPage,
        setItemsPerPage,
        itemsPerPage,
        startIndex,
        endIndex,
        totalItems: items.length,
    };
}

