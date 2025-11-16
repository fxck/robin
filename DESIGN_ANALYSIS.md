# Pixel-Perfect Design Analysis & Fix Guide

## Dashboard Page - Screenshot 1 Analysis

### 1. PAGE HEADER (Top Section)
**Visual Issues in Screenshot:**
- "Dashboard" heading appears too small relative to page importance
- "Welcome back, Aleš Rcht" has poor visual hierarchy - same color as heading
- "New Post" button is too far right, creates imbalance
- Excessive whitespace between header and content (~80-100px)

**Code Location:** `dashboard.tsx:167-182`
```tsx
<Flex justify="between" align="start" className="flex-col md:flex-row gap-6 md:items-center">
  <div>
    <h1 className="text-5xl md:text-6xl font-bold mb-3 text-white">
      Dashboard
    </h1>
    <Text size="4" className="text-gray-400">
      Welcome back, {session?.user?.name || session?.user?.email}
    </Text>
  </div>
```

**Exact Fixes:**
```tsx
// Line 167: Reduce gap from gap-6 to gap-4, add proper alignment
<Flex justify="between" align="start" className="flex-col md:flex-row gap-4 md:items-start">
  <div className="space-y-2"> {/* Add proper spacing container */}
    {/* Line 169: Reduce heading size, use proper scale */}
    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
      Dashboard
    </h1>
    {/* Line 172: Reduce text size, use semantic color */}
    <Text size="3" style={{ color: 'var(--color-text-tertiary)' }}>
      Welcome back, {session?.user?.name || session?.user?.email}
    </Text>
  </div>
```

---

### 2. STATS CARDS GRID (4 Cards)
**Visual Issues in Screenshot:**
- Cards feel cramped horizontally (gap too small)
- Icon boxes are too small, icons lost in gradient backgrounds
- "PUBLISHED POSTS" label has poor contrast
- Number "2" feels too large relative to card size
- Card backgrounds barely visible against page background

**Code Location:** `dashboard.tsx:236-261`
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  <StatCard
    title="Published Posts"
    value={publishedPosts.length}
    icon={<FileText className="h-6 w-6 text-amber-400" />}
    gradient="bg-gradient-to-br from-amber-500/20 to-amber-600/20"
  />
```

**StatCard Component Location:** `dashboard.tsx:39-57`
```tsx
function StatCard({ title, value, icon, gradient }: StatCardProps) {
  return (
    <div className="glass-surface rounded-xl p-7 transition-all hover:bg-white/[0.07]">
      <Flex direction="column" gap="4">
        <div className={`w-fit rounded-lg ${gradient} p-3`}>
          {icon}
        </div>
```

**Exact Fixes:**

1. **Grid Gap** - Line 236:
```tsx
{/* Increase gap from gap-5 (20px) to gap-6 (24px) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

2. **StatCard Component** - Lines 41-53:
```tsx
function StatCard({ title, value, icon, gradient }: StatCardProps) {
  return (
    {/* Reduce padding from p-7 (28px) to p-6 (24px) */}
    <div className="glass-surface rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.07]">
      {/* Reduce gap from gap-4 (16px) to gap-3 (12px) */}
      <Flex direction="column" gap="3">
        {/* Increase icon container from p-3 (12px) to p-3.5 (14px), use stronger gradient */}
        <div className={`w-fit rounded-lg ${gradient.replace('/20', '/30')} p-3.5`}>
          {/* Increase icon size from h-6 w-6 to h-7 w-7 */}
          {React.cloneElement(icon as React.ReactElement, {
            className: (icon as React.ReactElement).props.className.replace('h-6 w-6', 'h-7 w-7')
          })}
        </div>
        <div className="space-y-1.5"> {/* Add spacing container */}
          {/* Fix: Use semantic color variable instead of text-gray-400 */}
          {/* Fix: Reduce tracking from tracking-wide to tracking-wider */}
          <Text size="1" weight="medium" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wider">
            {title}
          </Text>
          {/* Reduce heading from size 8 to size 7 */}
          <Heading size="7" className="text-white font-bold">
            {value.toLocaleString()}
          </Heading>
        </div>
      </Flex>
    </div>
  );
}
```

3. **Individual Card Gradient Updates** - Lines 237-260:
```tsx
{/* Increase opacity from /20 to /30 */}
gradient="bg-gradient-to-br from-amber-500/30 to-amber-600/30"
gradient="bg-gradient-to-br from-blue-500/30 to-blue-600/30"
gradient="bg-gradient-to-br from-green-500/30 to-emerald-600/30"
gradient="bg-gradient-to-br from-pink-500/30 to-rose-600/30"
```

---

### 3. RECENT ACTIVITY SECTION
**Visual Issues in Screenshot:**
- Section title "Recent Activity" lacks visual weight
- Activity cards have inconsistent internal spacing
- Post titles too large, makes cards feel cluttered
- Date and badge spacing awkward
- View/like icons too small, hard to see

**Code Location:** `dashboard.tsx:264-300`
```tsx
<div className="glass-surface p-8 rounded-xl">
  <Flex direction="column" gap="6">
    <Heading size="6" weight="bold">Recent Activity</Heading>

    <div className="space-y-3">
      {posts.slice(0, 4).map((post) => (
        <div key={post.id} className="p-5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
          <Flex justify="between" align="start" gap="4">
```

**Exact Fixes:**

1. **Container** - Line 265:
```tsx
{/* Reduce padding from p-8 (32px) to p-6 (24px) */}
<div className="glass-surface p-6 rounded-xl">
  {/* Reduce gap from gap-6 (24px) to gap-5 (20px) */}
  <Flex direction="column" gap="5">
    {/* Keep size 6 but add proper color */}
    <Heading size="6" weight="bold" style={{ color: 'var(--color-text-primary)' }}>
      Recent Activity
    </Heading>
```

2. **Activity Cards** - Lines 270-295:
```tsx
<div className="space-y-2.5"> {/* Reduce from space-y-3 (12px) to space-y-2.5 (10px) */}
  {posts.slice(0, 4).map((post) => (
    {/* Reduce padding from p-5 (20px) to p-4 (16px), add transition duration */}
    <div key={post.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
      <Flex justify="between" align="start" gap="4">
        <div className="flex-1 min-w-0 space-y-2"> {/* Add spacing container, reduce from space-y-2.5 */}
          {/* Reduce title from size 3 to size 2, use semantic color */}
          <Text size="2" weight="bold" className="block" style={{ color: 'var(--color-text-primary)' }}>
            {post.title}
          </Text>
          <Flex gap="3" align="center">
            {/* Use semantic color for date */}
            <Text size="1" style={{ color: 'var(--color-text-tertiary)' }}>
              {formatDate(post.publishedAt || post.createdAt)}
            </Text>
            {/* Reduce badge from size 2 to size 1 */}
            <Badge color={post.status === 'published' ? 'green' : 'gray'} size="1">
              {post.status}
            </Badge>
          </Flex>
        </div>
        {/* Reduce gap from gap-5 (20px) to gap-4 (16px) */}
        <Flex gap="4" align="center" className="flex-shrink-0" style={{ color: 'var(--color-text-tertiary)' }}>
          <Flex gap="1.5" align="center"> {/* Reduce gap from gap-2 */}
            <Eye size={14} /> {/* Reduce from size 16 to 14 */}
            <Text size="1" weight="medium">{post.views}</Text> {/* Reduce from size 2 */}
          </Flex>
          <Flex gap="1.5" align="center">
            <Heart size={14} />
            <Text size="1" weight="medium">{post.likesCount}</Text>
          </Flex>
        </Flex>
      </Flex>
    </div>
  ))}
</div>
```

---

### 4. ALL POSTS TABLE
**Visual Issues in Screenshot:**
- Header "All Posts" vs "View All →" spacing inconsistent
- Table headers too bold/heavy
- Row hover state too subtle
- Action buttons (eye, edit, delete) too close together
- Column widths not optimized (TITLE too narrow, ACTIONS too wide)
- Excerpt text truncation awkward

**Code Location:** `dashboard.tsx:302-438`
```tsx
<div className="glass-surface rounded-xl overflow-hidden">
  <Flex direction="column">
    <Flex justify="between" align="center" className="px-8 py-6 border-b border-white/10">
      <Heading size="6" weight="bold">All Posts</Heading>
```

**Exact Fixes:**

1. **Table Header** - Lines 305-311:
```tsx
{/* Reduce padding from px-8 py-6 to px-6 py-5 */}
<Flex justify="between" align="center" className="px-6 py-5 border-b border-white/10">
  <Heading size="6" weight="bold" style={{ color: 'var(--color-text-primary)' }}>
    All Posts
  </Heading>
  <Link to="/admin/posts" style={{ textDecoration: 'none' }}>
    {/* Add proper hover state */}
    <Button variant="ghost" size="2" className="text-amber-400 hover:text-amber-300 transition-colors">
      View All →
    </Button>
  </Link>
</Flex>
```

2. **Table Column Headers** - Lines 346-363:
```tsx
<Table.Header>
  <Table.Row>
    {/* Reduce padding from py-4 px-6 to py-3 px-5 */}
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '45%' }}> {/* Add explicit width */}
      {/* Reduce from size 2, use semantic color, reduce tracking */}
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Title
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '12%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Status
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '10%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Views
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '10%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Likes
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '13%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Date
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '10%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Actions
      </Text>
    </Table.ColumnHeaderCell>
  </Table.Row>
</Table.Header>
```

3. **Table Rows** - Lines 368-431:
```tsx
{posts.slice(0, 10).map((post) => (
  {/* Add duration to hover transition */}
  <Table.Row key={post.id} className="hover:bg-white/[0.08] transition-colors duration-150">
    {/* Reduce padding from py-5 px-6 to py-4 px-5 */}
    <Table.Cell className="py-4 px-5">
      <Flex direction="column" gap="1.5"> {/* Reduce gap from gap-2 */}
        {/* Reduce from size 3 to size 2 */}
        <Text size="2" weight="medium" style={{ color: 'var(--color-text-primary)' }}>
          {post.title}
        </Text>
        {post.excerpt && (
          {/* Fix: Use CSS line-clamp instead of substring */}
          <Text size="1" style={{ color: 'var(--color-text-tertiary)' }} className="line-clamp-2">
            {post.excerpt}
          </Text>
        )}
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Badge color={post.status === 'published' ? 'green' : 'gray'} size="1">
        {post.status}
      </Badge>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex gap="1.5" align="center">
        <Eye size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        <Text size="2" weight="medium">{post.views}</Text>
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex gap="1.5" align="center">
        <Heart size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        <Text size="2" weight="medium">{post.likesCount}</Text>
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Text size="1" style={{ color: 'var(--color-text-tertiary)' }}>
        {formatDate(post.publishedAt || post.createdAt)}
      </Text>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      {/* Increase gap from gap-2 (8px) to gap-2.5 (10px) */}
      <Flex gap="2.5">
        {/* Reduce all buttons from size 2 to size 1 */}
        <Button size="1" variant="soft" onClick={...}>
          <Eye size={14} /> {/* Reduce icon from 16 to 14 */}
        </Button>
        <Button size="1" variant="soft" color="blue" onClick={...}>
          <Edit size={14} />
        </Button>
        <Button size="1" variant="soft" color="red" onClick={...}>
          <Trash2 size={14} />
        </Button>
      </Flex>
    </Table.Cell>
  </Table.Row>
))}
```

---

## Posts Page - Screenshot 2 Analysis

### 1. PAGE HEADER
**Visual Issues in Screenshot:**
- "Posts" heading too large (bigger than "Dashboard")
- No subtitle/description creates void
- "New Post" button positioning inconsistent with dashboard
- Header bottom margin too large

**Code Location:** `admin.posts.index.tsx:169-177`
```tsx
<Flex justify="between" align="center" mb="2">
  <Heading size="9" weight="bold">Posts</Heading>
  <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
    <Button size="3">
      <PlusCircle size={18} />
      New Post
    </Button>
  </Link>
</Flex>
```

**Exact Fixes:**
```tsx
{/* Change from mb="2" (8px) to mb="6" (24px), align to start like dashboard */}
<Flex justify="between" align="start" className="mb-6">
  {/* Reduce from size 9 to size 8 to match dashboard hierarchy */}
  <div className="space-y-2">
    <Heading size="8" weight="bold" className="tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
      Posts
    </Heading>
    <Text size="3" style={{ color: 'var(--color-text-tertiary)' }}>
      Manage your blog posts and drafts
    </Text>
  </div>
  <Link to="/admin/posts/new" style={{ textDecoration: 'none' }}>
    {/* Match dashboard button styling */}
    <Button size="3" className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold shadow-accent hover:shadow-accent-hover">
      <PlusCircle size={18} />
      New Post
    </Button>
  </Link>
</Flex>
```

---

### 2. STATS CARDS (Top Row)
**Visual Issues in Screenshot:**
- Plain white cards lack visual interest (no glass effect like dashboard)
- No icons (compare to dashboard's icon-gradient boxes)
- Labels and numbers have poor hierarchy
- Cards feel disconnected from page design language

**Code Location:** `admin.posts.index.tsx:180-205`
```tsx
<Grid columns={{ initial: '1', sm: '3' }} gap="5">
  <Card>
    <Flex direction="column" gap="3" p="5">
      <Text size="2" weight="medium" color="gray" className="uppercase tracking-wide">
        Total Posts
      </Text>
      <Heading size="8">{allPosts.length}</Heading>
    </Flex>
  </Card>
```

**Exact Fixes:**

1. **Replace with Dashboard-Style Stats** - Lines 180-205:
```tsx
{/* Increase gap from gap-5 to gap-6 to match dashboard */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  {/* TOTAL POSTS */}
  <div className="glass-surface rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.07]">
    <Flex direction="column" gap="3">
      <div className="w-fit rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/30 p-3.5">
        <FileText className="h-7 w-7 text-purple-400" />
      </div>
      <div className="space-y-1.5">
        <Text size="1" weight="medium" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wider">
          Total Posts
        </Text>
        <Heading size="7" className="text-white font-bold">
          {allPosts.length}
        </Heading>
      </div>
    </Flex>
  </div>

  {/* PUBLISHED */}
  <div className="glass-surface rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.07]">
    <Flex direction="column" gap="3">
      <div className="w-fit rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-600/30 p-3.5">
        <CheckCircle className="h-7 w-7 text-green-400" />
      </div>
      <div className="space-y-1.5">
        <Text size="1" weight="medium" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wider">
          Published
        </Text>
        <Heading size="7" className="text-white font-bold">
          {allPosts.filter(p => p.status === 'published').length}
        </Heading>
      </div>
    </Flex>
  </div>

  {/* DRAFTS */}
  <div className="glass-surface rounded-xl p-6 transition-all duration-200 hover:bg-white/[0.07]">
    <Flex direction="column" gap="3">
      <div className="w-fit rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-3.5">
        <Clock className="h-7 w-7 text-blue-400" />
      </div>
      <div className="space-y-1.5">
        <Text size="1" weight="medium" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wider">
          Drafts
        </Text>
        <Heading size="7" className="text-white font-bold">
          {allPosts.filter(p => p.status === 'draft').length}
        </Heading>
      </div>
    </Flex>
  </div>
</div>
```

2. **Add Missing Icon Imports** - Line 19:
```tsx
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, X, Heart, FileText, CheckCircle, Clock } from 'lucide-react';
```

---

### 3. SEARCH AND FILTERS SECTION
**Visual Issues in Screenshot:**
- Search box has inconsistent height with filter dropdowns
- Filter icons too close to text
- "Clear Filters" button appears/disappears abruptly
- Bulk actions bar (yellow) has poor contrast
- Overall section feels cluttered, lacks breathing room

**Code Location:** `admin.posts.index.tsx:207-312`
```tsx
<Card>
  <Flex direction="column" gap="5" p="6">
    <Flex gap="3" wrap="wrap" align="center">
      {/* Search */}
      <Box style={{ flex: '1', minWidth: '250px' }}>
        <TextField.Root
          placeholder="Search posts..."
```

**Exact Fixes:**

1. **Card Container** - Line 208:
```tsx
{/* Use glass-surface instead of Card, reduce padding */}
<div className="glass-surface rounded-xl">
  <Flex direction="column" gap="4" className="p-5"> {/* Reduce from gap-5 p-6 */}
    <Flex gap="2.5" wrap="wrap" align="center"> {/* Reduce gap from 3 */}
```

2. **Search Input** - Lines 212-234:
```tsx
<Box style={{ flex: '1', minWidth: '280px' }}> {/* Increase minWidth for better proportion */}
  <TextField.Root
    placeholder="Search posts..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    size="2"
    style={{ height: '36px' }} {/* Match filter dropdown height */}
  >
    <TextField.Slot>
      <Search size={15} style={{ color: 'var(--color-text-tertiary)' }} /> {/* Reduce from 16 */}
    </TextField.Slot>
    {searchQuery && (
      <TextField.Slot>
        <button
          onClick={() => setSearchQuery('')}
          className="hover:bg-white/10 rounded p-0.5 transition-colors"
        >
          <X size={14} />
        </button>
      </TextField.Slot>
    )}
  </TextField.Root>
</Box>
```

3. **Filter Dropdowns** - Lines 237-265:
```tsx
{/* Status Filter - add consistent sizing */}
<Select.Root value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
  <Select.Trigger style={{ minWidth: '140px', height: '36px' }}> {/* Add height */}
    <Flex align="center" gap="2">
      <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      <Text size="2">Status</Text> {/* Add explicit size */}
    </Flex>
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="all">All Status</Select.Item>
    <Select.Item value="published">Published</Select.Item>
    <Select.Item value="draft">Draft</Select.Item>
  </Select.Content>
</Select.Root>

{/* Date Filter */}
<Select.Root value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
  <Select.Trigger style={{ minWidth: '140px', height: '36px' }}>
    <Flex align="center" gap="2">
      <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      <Text size="2">Date</Text>
    </Flex>
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="all">All Time</Select.Item>
    <Select.Item value="today">Today</Select.Item>
    <Select.Item value="week">Past Week</Select.Item>
    <Select.Item value="month">Past Month</Select.Item>
  </Select.Content>
</Select.Root>
```

4. **Clear Filters Button** - Lines 268-273:
```tsx
{hasActiveFilters && (
  <Button variant="soft" size="2" onClick={clearFilters} className="transition-all duration-200">
    <X size={14} />
    Clear Filters
  </Button>
)}
```

5. **Bulk Actions Bar** - Lines 277-302:
```tsx
{selectedPosts.size > 0 && (
  <Flex
    gap="3"
    align="center"
    className="p-3 rounded-lg transition-all duration-200"
    style={{
      background: 'rgba(245, 158, 11, 0.1)', {/* Reduce from 0.15 */}
      border: '1px solid rgba(245, 158, 11, 0.2)', {/* Add border */}
    }}
  >
    <Text size="2" weight="medium" style={{ color: 'var(--color-text-primary)' }}>
      {selectedPosts.size} selected
    </Text>
    <Button size="2" variant="soft" color="red" onClick={() => setBulkDeleteDialog(true)}>
      <Trash2 size={14} />
      Delete Selected
    </Button>
    <Button size="2" variant="ghost" onClick={() => setSelectedPosts(new Set())}>
      Clear Selection
    </Button>
  </Flex>
)}
```

6. **Results Info** - Lines 306-310:
```tsx
{hasActiveFilters && (
  <Text size="1" style={{ color: 'var(--color-text-tertiary)' }}>
    Showing {filteredPosts.length} of {allPosts.length} posts
  </Text>
)}
```

---

### 4. POSTS TABLE
**Visual Issues in Screenshot:**
- Checkbox column too wide
- Title column too narrow (text wrapping awkwardly)
- "CREATED" column header vs "DATE" on dashboard - inconsistent naming
- Action buttons same issues as dashboard (too close)
- Table feels denser than dashboard table

**Code Location:** `admin.posts.index.tsx:339-437`

**Exact Fixes:**

1. **Table Headers** - Lines 342-366:
```tsx
<Table.Header>
  <Table.Row>
    {/* Reduce checkbox column width */}
    <Table.ColumnHeaderCell className="py-3 px-4" style={{ width: '40px' }}>
      <Checkbox
        checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
        onCheckedChange={() => toggleSelectAll(filteredPosts)}
      />
    </Table.ColumnHeaderCell>
    {/* Increase title column width */}
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '42%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Title
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '12%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Status
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '10%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Views
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '10%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Likes
      </Text>
    </Table.ColumnHeaderCell>
    {/* Change "CREATED" to "DATE" for consistency */}
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '13%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Date
      </Text>
    </Table.ColumnHeaderCell>
    <Table.ColumnHeaderCell className="py-3 px-5" style={{ width: '13%' }}>
      <Text size="1" weight="bold" style={{ color: 'var(--color-text-tertiary)' }} className="uppercase tracking-wide">
        Actions
      </Text>
    </Table.ColumnHeaderCell>
  </Table.Row>
</Table.Header>
```

2. **Table Rows** - Lines 369-434:
```tsx
{filteredPosts.map((post) => (
  <Table.Row key={post.id} className="hover:bg-white/[0.08] transition-colors duration-150">
    <Table.Cell className="py-4 px-4">
      <Checkbox
        checked={selectedPosts.has(post.id)}
        onCheckedChange={() => togglePostSelection(post.id)}
      />
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex direction="column" gap="1.5">
        <Text size="2" weight="medium" style={{ color: 'var(--color-text-primary)' }}>
          {post.title}
        </Text>
        {post.excerpt && (
          <Text size="1" style={{ color: 'var(--color-text-tertiary)' }} className="line-clamp-2">
            {post.excerpt}
          </Text>
        )}
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Badge color={post.status === 'published' ? 'green' : 'gray'} size="1">
        {post.status}
      </Badge>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex gap="1.5" align="center">
        <Eye size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        <Text size="2" weight="medium">{post.views}</Text>
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex gap="1.5" align="center">
        <Heart size={14} style={{ color: 'var(--color-text-tertiary)' }} />
        <Text size="2" weight="medium">{post.likesCount}</Text>
      </Flex>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Text size="1" style={{ color: 'var(--color-text-tertiary)' }}>
        {new Date(post.createdAt).toLocaleDateString()}
      </Text>
    </Table.Cell>
    <Table.Cell className="py-4 px-5">
      <Flex gap="2.5">
        <Button size="1" variant="soft" onClick={() => navigate({ to: `/posts/${post.id}` })}>
          <Eye size={14} />
        </Button>
        <Button size="1" variant="soft" color="blue" onClick={() => navigate({ to: `/admin/posts/${post.id}/edit` })}>
          <Edit size={14} />
        </Button>
        <Button size="1" variant="soft" color="red" onClick={() => setDeleteDialog({ id: post.id, title: post.title })} disabled={deleteMutation.isPending}>
          <Trash2 size={14} />
        </Button>
      </Flex>
    </Table.Cell>
  </Table.Row>
))}
```

---

## Global Page Layout Issues

Both pages have inconsistent wrapper/container setup:

**Dashboard:** `dashboard.tsx:164`
```tsx
<div className="max-w-7xl mx-auto px-6 md:px-8 py-16 pt-32 md:pt-36">
```

**Posts:** `admin.posts.index.tsx:165-166`
```tsx
<Box style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '100px' }}>
  <Container size="4" py="8">
```

**Fix: Create Shared Layout Component:**

Create new file: `apps/app/src/components/layout/PageLayout.tsx`
```tsx
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: '7xl' | '6xl' | '5xl';
}

export function PageLayout({ children, maxWidth = '7xl' }: PageLayoutProps) {
  const maxWidthClass = {
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div
      className={`${maxWidthClass} mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-16`}
      style={{ minHeight: 'calc(100vh - 80px)' }}
    >
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
}
```

Then use in both pages:
```tsx
<PageLayout>
  {/* page content */}
</PageLayout>
```

---

## CSS Additions Needed

Add to `styles.css`:

```css
/* Line-clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Improved table hover */
.rt-TableRow:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  transition: background-color 150ms ease;
}

/* Better focus states for checkboxes */
.rt-CheckboxButton:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

---

## Summary of Pixel-Perfect Changes

### Dashboard Page:
1. ✅ Reduce header spacing: `gap-6` → `gap-4`
2. ✅ Fix heading sizes: `text-5xl/6xl` → `text-4xl/5xl`
3. ✅ Increase stat card gaps: `gap-5` → `gap-6`
4. ✅ Boost icon sizes: `h-6 w-6` → `h-7 w-7`
5. ✅ Strengthen gradients: `/20` → `/30`
6. ✅ Reduce card padding: `p-7` → `p-6`
7. ✅ Tighten activity cards: `p-5` → `p-4`, `space-y-3` → `space-y-2.5`
8. ✅ Reduce icon/text sizes in activity: `size={16}` → `size={14}`
9. ✅ Add column widths to table
10. ✅ Increase action button spacing: `gap-2` → `gap-2.5`
11. ✅ Replace all `text-gray-*` with semantic CSS variables

### Posts Page:
1. ✅ Reduce heading from size 9 → size 8
2. ✅ Add page subtitle
3. ✅ Replace plain cards with glass-surface stat cards with icons
4. ✅ Fix search/filter heights and spacing
5. ✅ Improve bulk actions bar contrast
6. ✅ Standardize table with dashboard (column widths, padding, sizes)
7. ✅ Change "CREATED" → "DATE"
8. ✅ Add proper hover transitions
9. ✅ Fix checkbox column width

### Cross-Page:
1. ✅ Create shared `PageLayout` component
2. ✅ Standardize all spacing to use design system values
3. ✅ Replace all color classes with CSS variables
4. ✅ Consistent button styling and spacing
