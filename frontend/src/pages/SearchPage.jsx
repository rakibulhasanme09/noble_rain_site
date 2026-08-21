import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
import ProductFilterBar, { DEFAULT_PRODUCT_FILTERS } from '../components/ProductFilterBar';
import Pagination from '../components/Pagination';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['All']);
    const [filters, setFilters] = useState(DEFAULT_PRODUCT_FILTERS);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(['All', ...data.map((c) => c.name)]);
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };
        fetchCategories();
    }, []);

    // A new keyword is a fresh search - reset filters/page rather than
    // carrying over an unrelated category/price range from before.
    useEffect(() => {
        setFilters(DEFAULT_PRODUCT_FILTERS);
        setPage(1);
    }, [keyword]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ pageNumber: page, sort: filters.sort, keyword });
                if (filters.category !== 'All') params.set('category', filters.category);
                if (filters.minPrice) params.set('minPrice', filters.minPrice);
                if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
                if (filters.onSale) params.set('onSale', 'true');
                if (filters.inStock) params.set('inStock', 'true');

                const { data } = await axios.get(`/api/products?${params.toString()}`);
                setProducts(data.products);
                setPages(data.pages);
            } catch (error) {
                console.error('Error fetching products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [keyword, filters, page]);

    const handleFiltersChange = (next) => {
        setFilters(next);
        setPage(1);
    };

    return (
        <div className="search-page animate-fade-in">
            <section style={styles.collectionSection}>
                <div className="container-wide">
                    <h2 style={styles.sectionTitle}>
                        {keyword ? `Search results for "${keyword}"` : 'All Products'}
                    </h2>
                    <div className="shop-layout">
                        <ProductFilterBar categories={categories} filters={filters} onChange={handleFiltersChange} />
                        <div className="shop-content">
                            {loading ? (
                                <p style={{ textAlign: 'center' }}>Searching...</p>
                            ) : (
                                <>
                                    <ProductGrid
                                        products={products}
                                        emptyMessage={keyword ? `No products found matching "${keyword}".` : 'No products found.'}
                                    />
                                    <Pagination page={page} pages={pages} onPageChange={setPage} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const styles = {
    collectionSection: {
        padding: '6rem 0',
        backgroundColor: 'var(--color-bg-main)',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '3rem',
        color: 'var(--color-text-main)',
    },
};

export default SearchPage;
