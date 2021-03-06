import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Bebida } from '../../model/bebida';
import { NgxSpinnerService } from 'ngx-spinner';
import { TreeviewItem } from 'ngx-treeview';
import * as _ from 'lodash';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  bebidagroup: any[] = [];
  origngroup: any[] = [];
  editbebida: Bebida;
  odervalue = true;
  checkcategory: string;
  categories: any[] = ['VINO', 'CHAMPAGNE', 'WHISKY', 'ESPIRITUOSA', 'CERVEZA', 'ENERGIZANTE',
    'COOLERS', 'AGUA_GASEOSA_GRANADINA', 'FERNET_Y_APERITIVO', 'RON', 'VODKA', 'GIN', 'BOURBON'];
  menuconfig = {
    hasAllCheckBox: true,
    hasFilter: false,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: 500
  };
  menuitems: TreeviewItem[] = [];
  constructor(private  api: UserService,
              private  conf: ConfigService,
              private router: Router,
              private alerts: ToastrService,
              private spinner: NgxSpinnerService,
              private route: ActivatedRoute,
              public modalService: NgxSmartModalService) {

  }

  ngOnInit() {
    this.checkcategory = null;
    this.route.params.subscribe(params => {
      this.checkcategory = params['item'];
    });
    this.editbebida = new Bebida();
    this.spinner.show();
    this.getAllbebida();
  }

  getAllbebida() {
    this.api.getBebidaList().subscribe((res: any) => {
      this.sortbebida(res);
    }, err => {
      this.alerts.error('get bebidas error!');
      this.spinner.hide();
    });
  }
  sortbebida(data) {
    let shorgroup: any[] = [];
    const group = _.mapValues(_.groupBy(data, 'categoria'),
      clist => clist.map(bebida => _.omit(bebida)));
    shorgroup = Object.keys(group).map(key => ({ key, value: group[key] }));
    shorgroup.forEach(bgroup => {
      bgroup.value = _.orderBy(bgroup.value, ['precio_unidad'], ['asc']);
    });

    let newgroup: any[] = [];
    if (this.checkcategory) {
      if (this.checkcategory === 'Vinos') {
        newgroup.push(shorgroup.find(t => t.key === 'VINO'));
      } else if (this.checkcategory === 'Champagnes') {
        newgroup.push(shorgroup.find(t => t.key === 'CHAMPAGNE'));
      } else if (this.checkcategory === 'Whiskies_Espirituosas') {
        newgroup.push(shorgroup.find(t => t.key === 'ESPIRITUOSA'));
        newgroup.push(shorgroup.find(t => t.key === 'WHISKY'));
        newgroup.push(shorgroup.find(t => t.key === 'BOURBON'));
        newgroup.push(shorgroup.find(t => t.key === 'GIN'));
        newgroup.push(shorgroup.find(t => t.key === 'VODKA'));
        newgroup.push(shorgroup.find(t => t.key === 'RON'));
        newgroup.push(shorgroup.find(t => t.key === 'FERNET_Y_APERITIVO'));
      } else if (this.checkcategory === 'Cervezas_alcohol') {
        newgroup.push(shorgroup.find(t => t.key === 'CERVEZA'));
        newgroup.push(shorgroup.find(t => t.key === 'COOLERS'));
        newgroup.push(shorgroup.find(t => t.key === 'ENERGIZANTE'));
        newgroup.push(shorgroup.find(t => t.key === 'AGUA_GASEOSA_GRANADINA'));
      }
    } else {
      newgroup = shorgroup;
    }
    this.setmenu(newgroup);
    this.spinner.hide();

  }
  setmenu(alldata) {
    const menubuffer: TreeviewItem[] = [];
    alldata.forEach(d => {
      const newgroup = _(d.value)
        .groupBy(x => x.marca)
        .map((value, key) => ({marca: key, datas: value}))
        .value();
      this.origngroup.push({key: d.key, datas: newgroup});
      const submenu: any[] = [];
      newgroup.forEach(dd => {
        submenu.push({text: dd.marca, value: dd.marca});
      });
      if (submenu.length > 1) {
        menubuffer.push(new TreeviewItem({
          text: d.key, value: d.key, children: submenu
        }));
      } else {
        menubuffer.push(new TreeviewItem({
          text: d.key, value: submenu[0].value
        }));
      }

    });
    const wiskysubmenu: any[] = [];
    let agua_gaseosa_granadina: any = null;
    const cervesar_cooler: any[] = [];
    let champagn: any = null;
    let vinos: any = null;
    menubuffer.forEach( p => {
      if (p.text === 'ESPIRITUOSA' || p.text === 'WHISKY' || p.text === 'BOURBON' || p.text === 'GIN' || p.text === 'VODKA'
        || p.text === 'RON' || p.text === 'FERNET_Y_APERITIVO') {
        wiskysubmenu.push(p);
      } else if (p.text === 'AGUA_GASEOSA_GRANADINA') {
        agua_gaseosa_granadina = new TreeviewItem({
          text: 'AGUA GASEOSA Y GRANADINA', value: p.value
        });
      } else if (p.text === 'CERVEZA' || p.text === 'COOLERS' || p.text === 'ENERGIZANTE') {
        cervesar_cooler.push(p);
      } else if (p.text === 'CHAMPAGNE') {
        champagn = p;
      } else if (p.text === 'VINO') {
        vinos = p;
      }
    });
    if (wiskysubmenu.length > 0) {
      this.menuitems.push(new TreeviewItem({
        text: 'WHISKiES y ESPIRITUOSAS', value: 'WHISKiES y ESPIRITUOSAS', children: wiskysubmenu
      }));
    }
    if (agua_gaseosa_granadina) {
      this.menuitems.push(agua_gaseosa_granadina);
    }
    if (cervesar_cooler.length > 0) {
      this.menuitems.push(new TreeviewItem({
        text: 'CERVEZAS, COOLERS Y ENERGIZANTES', value: 'CERVEZAS, COOLERS Y ENERGIZANTES', children: cervesar_cooler
      }));
    }
    if (champagn) {
      this.menuitems.push(champagn);
    }
    if (vinos) {
      this.menuitems.push(vinos);
    }

    this.bebidagroup = Object.assign([], this.origngroup);
  }
  order(flag) {
    this.spinner.show();
    if (flag) {
      this.bebidagroup.forEach(bgroup => {
        bgroup.datas.forEach(group => {
          group.datas = _.orderBy(group.datas, ['precio_unidad'], ['asc']);
        });
      });
      this.spinner.hide();
    } else {
      this.bebidagroup.forEach(bgroup => {
        bgroup.datas.forEach(group => {
          group.datas = _.orderBy(group.datas, ['precio_unidad'], ['desc']);
        });
      });
      this.spinner.hide();
    }
  }

  onSelectedMenuChange(groups) {
    this.bebidagroup = [];
    const newdatas: any[] = [];
    groups.forEach(pp => {
      this.origngroup.forEach(bgroup => {
        const item = _.find(bgroup.datas, p => p['marca'] === pp);
        if (item !== -1 && item !== undefined) {
          newdatas.push({key: bgroup.key, datas: item});
        }
      });
    });
    const group = _.mapValues(_.groupBy(newdatas, 'key'),
      clist => clist.map(bebida => _.omit(bebida.datas)));
    this.bebidagroup = Object.keys(group).map(key => ({ key: key, datas: group[key] }));
  }
  addcart(product) {
    this.conf.addCart(product);
    this.alerts.success('added product');
  }
  pageChanged(event) {

  }
}
