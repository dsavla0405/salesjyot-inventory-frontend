import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SwapVertIcon from '@mui/icons-material/SwapVert';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StockCount() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [itemData, setItemData] = useState([]);
    const [comboData, setComboData] = useState([]);
    const [filters, setFilters] = useState({
        skucode: '',
        description: '',
        sellerSKUCode: '',
        count: '',
        comboName: '',
        qtyToMake: '',
    });

    useEffect(() => {
        // Fetch item data
        const fetchItemData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/stock-counts/items`);
                setItemData(response.data);
            } catch (error) {
                console.error('Error fetching item data:', error);
            }
        };

        // Fetch combo data
        const fetchComboData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/stock-counts/combos`);
                setComboData(response.data);
            } catch (error) {
                console.error('Error fetching combo data:', error);
            }
        };

        fetchItemData();
        fetchComboData();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const filterData = (data) => {
        return data.filter(item => (
            // Check for item skucode or comboName's skucode
            (item.item?.skucode?.toLowerCase().includes(filters.skucode.toLowerCase()) ||
             item.combo?.comboName?.skucode?.toLowerCase().includes(filters.skucode.toLowerCase())) &&
    
            // Check item description (or skip if no item)
            (item.item?.description?.toLowerCase().includes(filters.description.toLowerCase()) || !item.item) &&
    
            // Check sellerSKUCode (or skip if no item)
            (item.item?.sellerSKUCode?.toLowerCase().includes(filters.sellerSKUCode.toLowerCase()) || !item.item) &&
    
            // Check count
            item.count.toString().toLowerCase().includes(filters.count.toLowerCase()) &&
    
            // Check combo's qtyToMake (or skip if no combo)
            (item.combo?.qtyToMake?.toString().toLowerCase().includes(filters.qtyToMake.toLowerCase()) || !item.combo)
        ));
    };
    
    
    

    const colors = ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'];

    const createChartData = (data) => ({
        labels: data.map(item => item.item?.skucode || item.combo?.comboCode),
        datasets: [
            {
                label: 'Stock Count',
                data: data.map(item => item.count),
                backgroundColor: colors[0],
                borderColor: colors[1],
                borderWidth: 1,
            }
        ],
    });

    return (
        <Container fluid>
            <Row className="my-4">
                <Col>
                    <h1>Stock Count</h1>
                </Col>
            </Row>
            <Row>
                {/* Item Table and Chart */}
                <Col md={6}>
                    <Card>
                        <Card.Header>Item Stock Counts</Card.Header>
                        <Card.Body>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>SKU Code</th>
                                        <th>Description</th>
                                        <th>Seller SKU</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterData(itemData).map(item => (
                                        <tr key={item.stockCountId}>
                                            <td>{item.item?.skucode}</td>
                                            <td>{item.item?.description}</td>
                                            <td>{item.item?.sellerSKUCode}</td>
                                            <td>{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card className="mt-4">
                        <Card.Body>
                            <Bar
                                data={createChartData(itemData)}
                                options={{ title: { display: true, text: 'Item Stock Counts' } }}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Combo Table and Chart */}
                <Col md={6}>
                    <Card>
                        <Card.Header>Combo Stock Counts</Card.Header>
                        <Card.Body>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Combo Name</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filterData(comboData).map(item => (
                                        <tr key={item.stockCountId}>
                                            <td>{item.combo.comboName.skucode}</td>
                                            
                                            <td>{item.combo.qtyToMake}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                    <Card className="mt-4">
                        <Card.Body>
                            <Bar
                                data={createChartData(comboData)}
                                options={{ title: { display: true, text: 'Combo Stock Counts' } }}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default StockCount;
