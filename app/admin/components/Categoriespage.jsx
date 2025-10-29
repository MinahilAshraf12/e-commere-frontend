import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  AlertCircle, 
  Check, 
  Loader, 
  Tag,
  ImageIcon,
  Grid,
  List,
  ChevronUp,
  ChevronDown,
  Package
} from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    isActive: true,
    parentCategory: null,
    metaTitle: '',
    metaDescription: ''
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const url = showActiveOnly 
        ? `${API_BASE}/categories?active=true` 
        : `${API_BASE}/categories`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // Sort by order and then by name
        const sortedCategories = data.categories.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.name.localeCompare(b.name);
        });
        setCategories(sortedCategories);
        
        // Calculate stats
        const activeCount = sortedCategories.filter(cat => cat.isActive).length;
        setStats({
          total: sortedCategories.length,
          active: activeCount,
          inactive: sortedCategories.length - activeCount
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, showActiveOnly]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle form input change
  const handleFormChange = (field, value) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: '',
      icon: '',
      isActive: true,
      parentCategory: null,
      metaTitle: '',
      metaDescription: ''
    });
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  // Handle create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category created successfully!');
        resetForm();
        fetchCategories();
      } else {
        alert(data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  // Handle update category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category updated successfully!');
        resetForm();
        fetchCategories();
      } else {
        alert(data.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit category
  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || '',
      isActive: category.isActive,
      parentCategory: category.parentCategory || null,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || ''
    });
    setEditingCategory(category);
    setIsAddingCategory(true);
  };

  // Handle toggle active status
  const handleToggleActive = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE}/categories/${categoryId}/toggle-active`, {
        method: 'PATCH'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || 'Failed to toggle category status');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Failed to toggle category status');
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center">
                <Tag className="w-8 h-8 mr-3 text-pink-600" />
                Categories Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your product categories</p>
            </div>
            
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Categories</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">{stats.total}</p>
                </div>
                <Grid className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Categories</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">{stats.active}</p>
                </div>
                <Eye className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Inactive Categories</p>
                  <p className="text-3xl font-bold text-red-700 mt-1">{stats.inactive}</p>
                </div>
                <EyeOff className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Category Form */}
        {isAddingCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Tag className="w-6 h-6 mr-2" />
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="p-6 space-y-6">
                
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="Enter category description"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={categoryForm.image}
                    onChange={(e) => handleFormChange('image', e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  {categoryForm.image && (
                    <div className="mt-2">
                      <img 
                        src={categoryForm.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-pink-200"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                {/* Icon Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => handleFormChange('icon', e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="e.g., shirt, dress, shoe"
                  />
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={categoryForm.metaTitle}
                    onChange={(e) => handleFormChange('metaTitle', e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="SEO friendly title"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Meta Description
                  </label>
                  <textarea
                    value={categoryForm.metaDescription}
                    onChange={(e) => handleFormChange('metaDescription', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    placeholder="SEO friendly description"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={categoryForm.isActive}
                    onChange={(e) => handleFormChange('isActive', e.target.checked)}
                    className="w-5 h-5 text-pink-600 bg-gray-100 border-pink-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (visible to customers)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-pink-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-5 h-5 text-pink-600 bg-gray-100 border-pink-300 rounded focus:ring-pink-500"
              />
              <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
                Show Active Only
              </label>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-pink-100">
            <Loader className="w-12 h-12 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-pink-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No categories found</p>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="hover:bg-pink-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-pink-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center border-2 border-pink-200"
                          style={{ display: category.image ? 'none' : 'flex' }}
                        >
                          <Tag className="w-6 h-6 text-pink-600" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">/{category.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(category._id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {category.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;