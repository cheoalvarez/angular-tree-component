import { Component, Input, ViewChild } from '@angular/core';
import { TreeComponent , TreeNode, TreeModel, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';

const actionMapping: IActionMapping = {
  mouse: {
    contextMenu: (tree, node, $event) => {
      $event.preventDefault();
      alert(`context menu for ${node.data.name}`);
    },
    dblClick: (tree, node, $event) => {
      if (node.hasChildren) TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    },
    click: (tree, node, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(tree, node, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event)
    }
  },
  keys: {
    [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
  }
};

@Component({
  selector: 'app-fulltree',
  styles: [
        `

      md-sidenav {
        width: 300px;
      }

      .tree-container: {
        height: 1200px;
      }
      `
  ],
  template: `
  <md-sidenav-container>

    <md-sidenav mode="side" opened="true">
      <!-- sidenav content -->

      <form>
        <input #filter (keyup)="filterNodes(filter.value, tree)" placeholder="filter nodes"/>
      </form>

      <div style="height: 800px;">
        <tree-root
          #tree
          [nodes]="nodes"
          [options]="customTemplateStringOptions"
          [focused]="true"
          (event)="onEvent($event)"
          (initialized)="onInitialized(tree)"

        >
          <ng-template #treeNodeTemplate let-node>
            <md-checkbox
            (change)="check(node, !node.data.checked)"
            [indeterminate]="node.data.indeterminate"
            [checked]="node.data.checked">
            </md-checkbox>
            <span title="{{node.data.subTitle}}">{{ node.data.name }}</span>
            <span class="pull-right">{{ childrenCount(node) }}</span>
          </ng-template>
          <ng-template #loadingTemplate>Loading, please hold....</ng-template>
        </tree-root>
      </div>
    </md-sidenav>

    <!-- primary content -->

    <br>
    <p>Keys:</p>
    down | up | left | right | space | enter
    <p>Mouse:</p>
    click to select | shift+click to select multi
    <p>API:</p>
    <button (click)="tree.treeModel.focusNextNode()">next node</button>
    <button (click)="tree.treeModel.focusPreviousNode()">previous node</button>
    <button (click)="tree.treeModel.focusDrillDown()">drill down</button>
    <button (click)="tree.treeModel.focusDrillUp()">drill up</button>
    <button (click)="customTemplateStringOptions.allowDrag = true">allowDrag</button>
    <p></p>
    <button
      [disabled]="!tree.treeModel.getFocusedNode()"
      (click)="tree.treeModel.getFocusedNode().toggleActivated()">
      {{ tree.treeModel.getFocusedNode()?.isActive ? 'deactivate' : 'activate' }}
    </button>
    <button
      [disabled]="!tree.treeModel.getFocusedNode()"
      (click)="tree.treeModel.getFocusedNode().toggleExpanded()">
      {{ tree.treeModel.getFocusedNode()?.isExpanded ? 'collapse' : 'expand' }}
    </button>
    <button
      [disabled]="!tree.treeModel.getFocusedNode()"
      (click)="tree.treeModel.getFocusedNode().blur()">
      blur
    </button>
    <button
      (click)="addNode(tree)">
      Add Node
    </button>
    <button
      (click)="activateSubSub(tree)">
      Activate inner node
    </button>
    <button
      (click)="tree.treeModel.expandAll()">
      Expand All
    </button>
    <button
      (click)="tree.treeModel.collapseAll()">
      Collapse All
    </button>
    <button
      (click)="activeNodes(tree.treeModel)">
      getActiveNodes()
    </button>
    <!-- <button
    (click)="tree.sizeChanged()">
    Size Changed()
    </button> -->
  </md-sidenav-container>
  `
})
export class FullTreeComponent {
  @ViewChild('tree') tree: TreeComponent;
  nodes: any[];
  nodes2 = [{ name: 'root' }, { name: 'root2' }];
  constructor() {
  }
  ngOnInit() {
    setTimeout(() => {
      this.nodes = [
        {
          expanded: true,
          name: 'root expanded',
          subTitle: 'the root',
          children: [
            {
              name: 'child1',
              subTitle: 'a good child',
              hasChildren: false
            }, {
              name: 'child2',
              subTitle: 'a bad child',
              hasChildren: false
            }
          ]
        },
        {
          name: 'root2',
          subTitle: 'the second root',
          children: [
            {
              name: 'child2.1',
              subTitle: 'new and improved',
              uuid: '11',
              hasChildren: false
            }, {
              name: 'child2.2',
              subTitle: 'new and improved2',
              children: [
                {
                  uuid: 1001,
                  name: 'subsub',
                  subTitle: 'subsub',
                  hasChildren: false
                }
              ]
            }
          ]
        },
        {
          name: 'asyncroot',
          hasChildren: true
        }
      ];

      for (let i = 0; i < 4; i++) {
        this.nodes.push({
          name: `rootDynamic${i}`,
          subTitle: `root created dynamically ${i}`,
          children: new Array((i + 1) * 1000).fill(null).map((item, n) => ({
            name: `childDynamic${i}.${n}`,
            subTitle: `child created dynamically ${i}`,
            hasChildren: false
          }))
        });
      }
    }, 1);
  }

  asyncChildren = [
    {
      name: 'child2.1',
      subTitle: 'new and improved'
    }, {
      name: 'child2.2',
      subTitle: 'new and improved2'
    }
  ];

  getChildren(node: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(this.asyncChildren.map((c) => {
        return Object.assign({}, c, {
          hasChildren: node.level < 5
        });
      })), 1000);
    });
  }

  addNode(tree) {
    this.nodes[0].children.push({

      name: 'a new child'
    });
    tree.treeModel.update();
  }

  childrenCount(node: TreeNode): string {
    return node && node.children ? `(${node.children.length})` : '';
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text);
  }

  activateSubSub(tree) {
    // tree.treeModel.getNodeBy((node) => node.data.name === 'subsub')
    tree.treeModel.getNodeById(1001)
      .setActiveAndVisible();
  }

  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node) => this.check(node, !node.data.checked)
    }
  };

  customTemplateStringOptions: ITreeOptions = {
    // displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    getChildren: this.getChildren.bind(this),
    actionMapping: this.actionMapping,
    nodeHeight: 30,
    allowDrag: (node) => {
      // console.log('allowDrag?');
      return true;
    },
    allowDrop: (node) => {
      // console.log('allowDrop?');
      return true;
    },
    useVirtualScroll: true,
    animateExpand: false,
    animateSpeed: 30,
    animateAcceleration: 1.2
  }
  onEvent(event) {
    console.log(event);
  }

  onInitialized(tree) {
    // tree.treeModel.getNodeById('11').setActiveAndVisible();
  }

  go($event) {
    $event.stopPropagation();
    alert('this method is on the app component');
  }

  activeNodes(treeModel) {
    console.log(treeModel.activeNodes);
  }

  public check(node, checked) {
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
  }
  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => this.updateChildNodeCheckbox(child, checked));
    }
  }
  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }

    let allChildrenChecked = true;
    let noChildChecked = true;

    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }

    if (allChildrenChecked) {
      node.data.checked = true;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      node.data.checked = true;
      node.data.indeterminate = true;
    }
    this.updateParentNodeCheckbox(node.parent);
  }
}
