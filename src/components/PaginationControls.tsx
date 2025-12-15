import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (size: number) => void;
    itemsPerPageOptions?: number[];
}

export function PaginationControls({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near the start
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end
                pages.push('ellipsis');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push('ellipsis');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1 && totalItems <= itemsPerPage) {
        return null; // Don't show pagination if there's only one page or less
    }

    return (
        <div className="flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                    Affichage de {startIndex + 1} à {endIndex} sur {totalItems} résultats
                </span>
                <span className="mx-2">•</span>
                <span>
                    Éléments par page:
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
                    <SelectTrigger className="w-[80px] h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {itemsPerPageOptions.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Précédent
                        </Button>
                    </PaginationItem>

                    {pageNumbers.map((page, index) => {
                        if (page === 'ellipsis') {
                            return (
                                <PaginationItem key={`ellipsis-${index}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }

                        return (
                            <PaginationItem key={page}>
                                <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page)}
                                    className="min-w-[40px]"
                                >
                                    {page}
                                </Button>
                            </PaginationItem>
                        );
                    })}

                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

