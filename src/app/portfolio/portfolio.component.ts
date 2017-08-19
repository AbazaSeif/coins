import { Component, OnInit, HostListener } from '@angular/core';
import { PortfolioService } from './portfolio.service';
import { Ng2DeviceService } from 'ng2-device-detector';
import { LocalDataSource } from "ng2-smart-table/index";
import { Asset } from '../model/asset';
import { Router } from '@angular/router';
import { CheckboxColumnComponent } from '../coins/checkbox-column.component';

@Component({
    selector: 'app-portfolio',
    providers: [
        PortfolioService,
        Ng2DeviceService
    ],
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

    public coins: Asset[];
    public showTable: boolean = true;
    public source: LocalDataSource;
    public totalValue: number;
    public init;
    public settings: Object = {
        columns: {
            'in_portfolio': {
                title: '+/-',
                width: '5%',
                type: 'custom',
                renderComponent: CheckboxColumnComponent,
                onComponentInitFunction(instance) {
                    instance.portfolio = true;
                    instance.save.subscribe(row => {
                    });
                }
            },
            'name': {
                title: 'Name',
                width: '15%',
                type: 'html',
                valuePrepareFunction: (value, row) => {
                    let imgUrl = row.image_url;
                    if (!imgUrl) {
                        imgUrl = "/assets/icons/default.png";
                    }
                    return "<img src='" + imgUrl + "' width='25px' height='25px' /> " + value;
                }
            },
            'symbol': {
                title: 'Symbol',
                width: '10%'
            },
            'value': {
                title: 'Value',
                width: '30%',
                sort: 'asc',
                valuePrepareFunction: (value) => {
                    return '$' + Number(value).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2})
                },
                compareFunction: (dir, a, b) => this.compareNumbers(dir, a, b)
            },
            'quantity': {
                title: '# Owned',
                width: '10%',
                sort: 'desc',
                valuePrepareFunction: (value) => {
                    return Number(value).toLocaleString('en',
                            { maximumFractionDigits: 5 })
                },
                compareFunction: (dir, a, b) => this.compareNumbers(dir, a, b)
            }
        },
        hideSubHeader: true,
        actions: {
            add: false,
            edit: false,
            delete: false
        },
        pager: {
            display: true,
            perPage: 50
        },
        attr: {
            class: 'table table-bordered table-striped table-hover table-rankings'
        },
        noDataMessage: "Loading Portfolio Data ..."

    };

    chartData: any[] = [];
    view: any[] = [];
    gradient: boolean = true;
    showLegend: boolean = true;
    explodeSlices: boolean = true;
    showLabels: boolean = true;
    arcWidth: number = .25;
   
    mobileDevice: boolean = false;

    constructor(private portfolioService: PortfolioService,
                private router: Router,
                private deviceService: Ng2DeviceService) {}

    ngOnInit() {
        this.mobileDevice = this.deviceService.isMobile();

        this.initList();
    }

    initList(): void {
        this.portfolioService.getList()
            .subscribe(
                coinData => {
                    this.chartData = [];
                    this.coins = coinData.coins;
                    this.totalValue = coinData.totalValue;
                    this.source = new LocalDataSource(this.coins);
                    if (this.coins.length == 0) {
                        this.showTable = false;
                    } else {
                        for (let coin of this.coins) {
                            this.chartData.push({ "name" : coin.symbol, "value": coin.value });
                        }
                    }
                    this.init = true;
                }
            );

    }

    compareNumbers(dir: number, a: any, b: any): number {
        let a1 = Number(a);
        let b1 = Number(b);
        if (a1 < b1) {
            return -1 * dir;
        } else if (a1 > b1) {
            return dir;
        }
        return 0;
    }

    clickRow(event): void {

        let symbol = event.data.symbol;
        if (symbol) {
            this.router.navigate(['/coins', symbol]);
        }

    }

    onChartSliceSelect(event) {
        console.log(event);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event){
        let w = event.target.innerWidth;
        if (w < 450) {
            this.showLegend = false;
        } else {
            this.showLegend = true;
        }
    }
}
