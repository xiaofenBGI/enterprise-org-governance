// src/mock/orgData.ts
import type { OrgEntity, OrgRelation } from '@/types'

export const mockEntities: OrgEntity[] = [
  {
    id: '1',
    orgCode: 'HQ-001',
    orgName: '集团总部',
    orgType: '总部',
    status: 'ACTIVE',
    legalRep: '张三',
    registeredCapital: '10亿',
    establishDate: '2000-01-01',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'P1',
    orgCode: 'GD-PROV',
    orgName: '广东省公司',
    orgType: '省级',
    status: 'ACTIVE',
    legalRep: '李四',
    registeredCapital: '5亿',
    establishDate: '2005-03-15',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'P2',
    orgCode: 'JS-PROV',
    orgName: '江苏省公司',
    orgType: '省级',
    status: 'ACTIVE',
    legalRep: '王五',
    registeredCapital: '4亿',
    establishDate: '2006-06-20',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'C5',
    orgCode: 'GD-C5',
    orgName: '广东省5市分公司',
    orgType: '地市',
    status: 'ACTIVE',
    legalRep: '赵六',
    registeredCapital: '5000万',
    establishDate: '2010-08-10',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'C10',
    orgCode: 'JS-C10',
    orgName: '江苏省10市分公司',
    orgType: '地市',
    status: 'ACTIVE',
    legalRep: '孙七',
    registeredCapital: '6000万',
    establishDate: '2012-04-05',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'C99',
    orgCode: 'OLD-COMP',
    orgName: '某孤悬公司',
    orgType: '地市',
    status: 'CANCELLED',
    legalRep: '周八',
    registeredCapital: '2000万',
    establishDate: '2008-01-01',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  },
  {
    id: 'C20',
    orgCode: 'JS-C20',
    orgName: '江苏省20市分公司',
    orgType: '地市',
    status: 'ACTIVE',
    legalRep: '吴九',
    registeredCapital: '3000万',
    establishDate: '2015-09-20',
    dataSource: 'SOURCE',
    createdAt: '2020-01-01 00:00:00',
    updatedAt: '2020-01-01 00:00:00'
  }
]

export const mockRelations: OrgRelation[] = [
  // 法人树
  { id: '1', parentId: null, childId: '1', treeType: 'LEGAL', levelNum: 1, effectiveDate: '2000-01-01', expiryDate: '9999-12-31' },
  { id: '2', parentId: '1', childId: 'P1', treeType: 'LEGAL', levelNum: 2, effectiveDate: '2005-03-15', expiryDate: '9999-12-31' },
  { id: '3', parentId: '1', childId: 'P2', treeType: 'LEGAL', levelNum: 2, effectiveDate: '2006-06-20', expiryDate: '9999-12-31' },
  { id: '4', parentId: 'P1', childId: 'C5', treeType: 'LEGAL', levelNum: 3, effectiveDate: '2010-08-10', expiryDate: '9999-12-31' },
  { id: '5', parentId: 'P2', childId: 'C10', treeType: 'LEGAL', levelNum: 3, effectiveDate: '2012-04-05', expiryDate: '9999-12-31' },
  { id: '6', parentId: 'P2', childId: 'C20', treeType: 'LEGAL', levelNum: 3, effectiveDate: '2015-09-20', expiryDate: '9999-12-31' },

  // 预算树
  { id: '11', parentId: null, childId: '1', treeType: 'BUDGET', levelNum: 1, effectiveDate: '2000-01-01', expiryDate: '9999-12-31' },
  { id: '12', parentId: '1', childId: 'P1', treeType: 'BUDGET', levelNum: 2, effectiveDate: '2005-03-15', expiryDate: '9999-12-31' },
  { id: '13', parentId: '1', childId: 'P2', treeType: 'BUDGET', levelNum: 2, effectiveDate: '2006-06-20', expiryDate: '9999-12-31' },
  { id: '14', parentId: 'P1', childId: 'C5', treeType: 'BUDGET', levelNum: 3, effectiveDate: '2010-08-10', expiryDate: '9999-12-31' },
  { id: '15', parentId: 'P2', childId: 'C10', treeType: 'BUDGET', levelNum: 3, effectiveDate: '2012-04-05', expiryDate: '9999-12-31' },
  { id: '16', parentId: 'P2', childId: 'C20', treeType: 'BUDGET', levelNum: 3, effectiveDate: '2015-09-20', expiryDate: '9999-12-31' },

  // 管理树
  { id: '21', parentId: null, childId: '1', treeType: 'MANAGEMENT', levelNum: 1, effectiveDate: '2000-01-01', expiryDate: '9999-12-31' },
  { id: '22', parentId: '1', childId: 'P1', treeType: 'MANAGEMENT', levelNum: 2, effectiveDate: '2005-03-15', expiryDate: '9999-12-31' },
  { id: '23', parentId: '1', childId: 'P2', treeType: 'MANAGEMENT', levelNum: 2, effectiveDate: '2006-06-20', expiryDate: '9999-12-31' },
  { id: '24', parentId: 'P1', childId: 'C5', treeType: 'MANAGEMENT', levelNum: 3, effectiveDate: '2010-08-10', expiryDate: '9999-12-31' },
  { id: '25', parentId: 'P2', childId: 'C10', treeType: 'MANAGEMENT', levelNum: 3, effectiveDate: '2012-04-05', expiryDate: '9999-12-31' },
  { id: '26', parentId: 'P2', childId: 'C20', treeType: 'MANAGEMENT', levelNum: 3, effectiveDate: '2015-09-20', expiryDate: '9999-12-31' }
]