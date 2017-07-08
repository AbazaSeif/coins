import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import { Coin } from '../model/coin';

@Injectable()
export class BootstrapService {

    private listUrl = environment.baseAPIUrl + 'coins';
    private data: any = [];
    private dataSubject = new BehaviorSubject<any>(this.data);
    private loaded: boolean = false;

    constructor(private http: Http) {
    }

    getCoins(): Observable<any> {
        return this.dataSubject.asObservable()
    }

    loadData(): void {
        let idx = 0;
        this.http.get(this.listUrl)
            .map(
                res => {
                    let jsonResults = res.json();
                    let collection = jsonResults.results.map(item => {
                        idx = idx + 1;
                        item.idx = idx;
                        let rowCoin = new Coin(item);
                        return rowCoin;
                        });
                    let marketCap = jsonResults.marketCap;
                    let returnVal = {
                        totalMarketCap: marketCap,
                        coins: collection
                    };
                    return returnVal;
                })
            .catch((err: Response, caught: Observable<any>) => {
                    return Observable.throw(caught);
                })
            .subscribe(
                coinData => {
                    this.dataSubject.next(coinData);
                }
            )
    }


}
